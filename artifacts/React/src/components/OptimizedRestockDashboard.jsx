import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MdRefresh, MdTrendingUp, MdWarning, MdCheckCircle, MdCalendarToday, MdSpeed } from 'react-icons/md';
import LoadingSpinner from './LoadingSpinner';
import { CacheService, debounce, BatchProcessor } from '../services/CacheService';

const OptimizedRestockDashboard = ({ products, api, showNotification }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [cacheStats, setCacheStats] = useState({ totalCached: 0, expired: 0 });

  // Memoize candidates calculation to avoid recalculation
  const restockCandidates = useMemo(() => {
    return products
      .filter(product => {
        const alertThreshold = Math.max(product.reorder_point || 0, 10);
        return product.stock <= alertThreshold;
      })
      .sort((a, b) => a.stock - b.stock) // Sort by stock level (most critical first)
      .slice(0, 15); // Limit to top 15 most critical items for performance
  }, [products]);

  // Debounced report generation to avoid excessive calls
  const debouncedGenerateReport = useCallback(
    debounce(() => {
      if (products.length > 0) {
        generateReport();
      }
    }, 1000),
    [products]
  );

  // Optimized report generation with progressive loading
  const generateReport = async (forceRefresh = false) => {
    setLoading(true);
    setLoadingProgress(0);
    
    try {
      const candidates = restockCandidates;
      
      if (candidates.length === 0) {
        setDashboardData({
          summary: {
            totalProducts: products.length,
            needsRestock: 0,
            criticalItems: 0,
            weeklyPriority: 0
          },
          recommendations: [],
          message: "All products are currently well-stocked!"
        });
        setLastGenerated(new Date());
        setLoading(false);
        return;
      }

      // Step 1: Show immediate summary data
      const criticalItems = candidates.filter(p => p.stock <= 5);
      const highPriorityItems = candidates.filter(p => p.stock <= 10 && p.stock > 5);
      
      const initialSummary = {
        totalProducts: products.length,
        needsRestock: candidates.length,
        criticalItems: criticalItems.length,
        weeklyPriority: criticalItems.length + highPriorityItems.length
      };

      setDashboardData({
        summary: initialSummary,
        recommendations: [],
        loading: true
      });
      setLoadingProgress(20);

      // Step 2: Check cache and separate cached vs non-cached items
      const cachedRecommendations = [];
      const itemsNeedingAPI = [];

      candidates.forEach(product => {
        if (!forceRefresh) {
          const cached = CacheService.getCachedRecommendation(product);
          if (cached) {
            cachedRecommendations.push({
              product,
              ...cached,
              fromCache: true
            });
          } else {
            itemsNeedingAPI.push(product);
          }
        } else {
          itemsNeedingAPI.push(product);
        }
      });

      setLoadingProgress(40);

      // Step 3: Show cached data immediately
      if (cachedRecommendations.length > 0) {
        const sortedCached = sortRecommendations(cachedRecommendations);
        setDashboardData(prev => ({
          ...prev,
          recommendations: sortedCached,
          loading: itemsNeedingAPI.length > 0
        }));
      }

      // Step 4: Process remaining items with batch processing
      if (itemsNeedingAPI.length > 0) {
        const batchProcessor = new BatchProcessor(3); // Process 3 at a time
        const newRecommendations = [];

        const processProduct = async (product) => {
          const requestData = {
            product_name: product.name,
            sku: product.sku || `SKU-${product.id}`,
            category: product.category || 'General',
            quantity: product.stock || 0
          };
          
          const response = await api.getRestockSuggestion(requestData);
          
          const isCritical = product.stock <= 5;
          const recommendation = {
            product,
            ...response,
            priority: isCritical ? 'critical' : product.stock <= 10 ? 'high' : 'medium'
          };

          // Cache the result
          CacheService.setCachedRecommendation(product, {
            ...response,
            priority: recommendation.priority
          });

          return recommendation;
        };

        const results = await batchProcessor.processBatch(itemsNeedingAPI, processProduct);
        
        results.forEach((result, index) => {
          const progress = 40 + ((index + 1) / results.length) * 50;
          setLoadingProgress(progress);

          if (result.success) {
            newRecommendations.push(result.data);
          } else {
            console.error(`Failed to get recommendation for product:`, result.error);
            // Add fallback recommendation
            const product = itemsNeedingAPI[result.originalIndex];
            newRecommendations.push({
              product,
              analyzer_summary: "Analysis temporarily unavailable",
              restock_suggestion: "Manual review recommended",
              reorder_message: "Please check this item manually",
              priority: product.stock <= 5 ? 'critical' : 'medium'
            });
          }

          // Update UI progressively as results come in
          const allRecommendations = [...cachedRecommendations, ...newRecommendations];
          const sorted = sortRecommendations(allRecommendations);
          
          setDashboardData(prev => ({
            ...prev,
            recommendations: sorted,
            loading: index < results.length - 1
          }));
        });
      }

      setDashboardData(prev => ({ ...prev, loading: false }));
      setLastGenerated(new Date());
      setCacheStats(CacheService.getCacheStats());
      
      const cacheHitRate = cachedRecommendations.length / candidates.length * 100;
      showNotification(
        `Generated restock report for ${candidates.length} items (${cacheHitRate.toFixed(0)}% from cache)`, 
        'success'
      );
    } catch (error) {
      console.error('Error generating report:', error);
      showNotification('Failed to generate restock report', 'error');
    } finally {
      setLoading(false);
      setLoadingProgress(100);
    }
  };

  // Helper function to sort recommendations
  const sortRecommendations = (recommendations) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2 };
    return recommendations.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.product.stock - b.product.stock;
    });
  };

  // Auto-generate report when component mounts or products change
  useEffect(() => {
    debouncedGenerateReport();
  }, [debouncedGenerateReport]);

  // Update cache stats on mount
  useEffect(() => {
    setCacheStats(CacheService.getCacheStats());
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return <MdWarning className="w-4 h-4" />;
      case 'high': return <MdTrendingUp className="w-4 h-4" />;
      case 'medium': return <MdCheckCircle className="w-4 h-4" />;
      default: return <MdCheckCircle className="w-4 h-4" />;
    }
  };

  const clearCacheAndRefresh = () => {
    CacheService.clearCache();
    setCacheStats({ totalCached: 0, expired: 0 });
    generateReport(true);
  };

  if (loading && !dashboardData) {
    return (
      <div className="p-8">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Generating AI-powered restock report...</p>
          {loadingProgress > 0 && (
            <div className="mt-4 w-64 mx-auto">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{loadingProgress.toFixed(0)}% complete</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Optimized Restock Dashboard</h2>
          <p className="text-gray-600 mt-1">AI-powered recommendations with smart caching</p>
          {lastGenerated && (
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MdCalendarToday className="w-4 h-4" />
                Last updated: {lastGenerated.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <MdSpeed className="w-4 h-4" />
                Cache: {cacheStats.totalCached} items
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearCacheAndRefresh}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Cache
          </button>
          <button
            onClick={() => generateReport(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <MdRefresh className="w-4 h-4" />
            Refresh Report
          </button>
        </div>
      </div>

      {dashboardData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.totalProducts}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <MdCheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Need Restock</p>
                  <p className="text-2xl font-bold text-orange-600">{dashboardData.summary.needsRestock}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <MdTrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Items</p>
                  <p className="text-2xl font-bold text-red-600">{dashboardData.summary.criticalItems}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <MdWarning className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Weekly Priority</p>
                  <p className="text-2xl font-bold text-purple-600">{dashboardData.summary.weeklyPriority}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <MdCalendarToday className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Loading Progress Bar */}
          {dashboardData.loading && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <LoadingSpinner size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Loading AI recommendations...</p>
                  <div className="mt-2 bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations List */}
          {dashboardData.message ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <MdCheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">All Good!</h3>
              <p className="text-green-700">{dashboardData.message}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">AI Recommendations</h3>
                <p className="text-sm text-gray-500">
                  Showing {dashboardData.recommendations.length} items
                  {restockCandidates.length > 15 && ` (limited from ${restockCandidates.length} total)`}
                </p>
              </div>
              
              {dashboardData.recommendations.map((item, index) => (
                <div 
                  key={item.product.id} 
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                    item.fromCache ? 'ring-1 ring-green-200' : ''
                  }`}
                >
                  <div className="p-6">
                    {/* Product Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{item.product.name}</h4>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            {getPriorityIcon(item.priority)}
                            {item.priority.toUpperCase()}
                          </span>
                          {item.fromCache && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                              <MdSpeed className="w-3 h-3" />
                              CACHED
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Current Stock:</span>
                            <span className="font-medium text-gray-900 ml-1">{item.product.stock}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">SKU:</span>
                            <span className="font-medium text-gray-900 ml-1">{item.product.sku}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Category:</span>
                            <span className="font-medium text-gray-900 ml-1">{item.product.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Price:</span>
                            <span className="font-medium text-gray-900 ml-1">${(item.product.price / 100).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-900 mb-2">📊 Analysis</h5>
                        <p className="text-sm text-blue-800">{item.analyzer_summary}</p>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-semibold text-green-900 mb-2">🎯 Recommendation</h5>
                        <p className="text-sm text-green-800 font-medium">{item.restock_suggestion}</p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-900 mb-2">📝 Action Plan</h5>
                        <p className="text-sm text-purple-800">{item.reorder_message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OptimizedRestockDashboard;
