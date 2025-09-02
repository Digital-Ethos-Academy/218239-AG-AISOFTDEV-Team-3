import React, { useState, useEffect } from 'react';
import { MdRefresh, MdTrendingUp, MdWarning, MdCheckCircle, MdCalendarToday } from 'react-icons/md';
import LoadingSpinner from './LoadingSpinner';

const RestockDashboard = ({ products, api, showNotification }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);

  // Helper function to identify products that need restocking
  const getRestockCandidates = () => {
    return products.filter(product => {
      const alertThreshold = Math.max(product.reorder_point || 0, 10);
      return product.stock <= alertThreshold;
    });
  };

  // Generate comprehensive restock report
  const generateReport = async () => {
    setLoading(true);
    try {
      const candidates = getRestockCandidates();
      
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

      // Get AI recommendations for each candidate
      const recommendations = [];
      let criticalCount = 0;

      for (const product of candidates) {
        try {
          const requestData = {
            product_name: product.name,
            sku: product.sku || `SKU-${product.id}`,
            category: product.category || 'General',
            quantity: product.stock || 0
          };
          
          console.log('Requesting restock suggestion for:', requestData);
          const response = await api.getRestockSuggestion(requestData);

          const isCritical = product.stock <= 5;
          if (isCritical) criticalCount++;

          recommendations.push({
            product,
            ...response,
            priority: isCritical ? 'critical' : product.stock <= 10 ? 'high' : 'medium'
          });
        } catch (error) {
          console.error(`Failed to get recommendation for ${product.name}:`, error);
          recommendations.push({
            product,
            analyzer_summary: "Analysis unavailable",
            restock_suggestion: "Manual review required",
            reorder_message: "Please check this item manually",
            priority: 'medium'
          });
        }
      }

      // Sort by priority
      const priorityOrder = { critical: 0, high: 1, medium: 2 };
      recommendations.sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.product.stock - b.product.stock;
      });

      setDashboardData({
        summary: {
          totalProducts: products.length,
          needsRestock: candidates.length,
          criticalItems: criticalCount,
          weeklyPriority: recommendations.filter(r => r.priority === 'critical' || r.priority === 'high').length
        },
        recommendations
      });

      setLastGenerated(new Date());
      showNotification(`Generated restock report for ${candidates.length} items`, 'success');
    } catch (error) {
      console.error('Error generating report:', error);
      showNotification('Failed to generate restock report', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate report when component mounts or products change
  useEffect(() => {
    if (products.length > 0) {
      generateReport();
    }
  }, [products]);

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

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Generating AI-powered restock report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weekly Restock Dashboard</h2>
          <p className="text-gray-600 mt-1">AI-powered recommendations for optimal inventory management</p>
          {lastGenerated && (
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
              <MdCalendarToday className="w-4 h-4" />
              Last updated: {lastGenerated.toLocaleString()}
            </p>
          )}
        </div>
        <button
          onClick={generateReport}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <MdRefresh className="w-4 h-4" />
          Refresh Report
        </button>
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

          {/* Recommendations List */}
          {dashboardData.message ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <MdCheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">All Good!</h3>
              <p className="text-green-700">{dashboardData.message}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">AI Recommendations</h3>
              
              {dashboardData.recommendations.map((item, index) => (
                <div key={item.product.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Current Stock:</span>
                            <span className="font-medium text-gray-900 ml-1">{item.product.stock}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Reorder Level:</span>
                            <span className="font-medium text-gray-900 ml-1">{item.product.reorder_point || 'Not set'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Price:</span>
                            <span className="font-medium text-gray-900 ml-1">${item.product.price}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Supplier:</span>
                            <span className="font-medium text-gray-900 ml-1">{item.product.supplier}</span>
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

export default RestockDashboard;
