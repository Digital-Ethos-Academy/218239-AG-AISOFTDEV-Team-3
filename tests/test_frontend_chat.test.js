/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatWidget from '../src/components/ChatWidget';

// Mock the LoadingSpinner component
jest.mock('../src/components/LoadingSpinner', () => {
  return function MockLoadingSpinner({ size = 20, color = '#6366f1' }) {
    return <div data-testid="loading-spinner" style={{ width: size, height: size, color }}>Loading...</div>;
  };
});

// Mock fetch for API calls
global.fetch = jest.fn();

describe('ChatWidget Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  test('renders chat widget with initial state', () => {
    render(<ChatWidget />);
    
    expect(screen.getByPlaceholderText('Ask me about your inventory...')).toBeInTheDocument();
    expect(screen.getByText('Ask AI')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
  });

  test('shows send button as disabled when input is empty', () => {
    render(<ChatWidget />);
    
    const sendButton = screen.getByTestId('send-button');
    expect(sendButton).toBeDisabled();
  });

  test('enables send button when input has text', () => {
    render(<ChatWidget />);
    
    const input = screen.getByPlaceholderText('Ask me about your inventory...');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: 'How many products do we have?' } });
    
    expect(sendButton).not.toBeDisabled();
  });

  test('updates input value when typing', () => {
    render(<ChatWidget />);
    
    const input = screen.getByPlaceholderText('Ask me about your inventory...');
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    
    expect(input.value).toBe('Test message');
  });

  test('sends message when send button is clicked', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'AI response to your question' })
    });

    render(<ChatWidget />);
    
    const input = screen.getByPlaceholderText('Ask me about your inventory...');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: 'How many products?' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: 'How many products?' })
      });
    });
  });

  test('sends message when Enter key is pressed', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'AI response' })
    });

    render(<ChatWidget />);
    
    const input = screen.getByPlaceholderText('Ask me about your inventory...');
    
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  test('does not send message when Shift+Enter is pressed', () => {
    render(<ChatWidget />);
    
    const input = screen.getByPlaceholderText('Ask me about your inventory...');
    
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: true });
    
    expect(fetch).not.toHaveBeenCalled();
  });

  test('shows loading state during API call', async () => {
    fetch.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
      ok: true,
      json: async () => ({ response: 'Response' })
    }), 100)));

    render(<ChatWidget />);
    
    const input = screen.getByPlaceholderText('Ask me about your inventory...');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(sendButton);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  test('displays AI response in chat history', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'You have 25 products in your inventory.' })
    });

    render(<ChatWidget />);
    
    const input = screen.getByPlaceholderText('Ask me about your inventory...');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: 'How many products?' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('How many products?')).toBeInTheDocument();
      expect(screen.getByText('You have 25 products in your inventory.')).toBeInTheDocument();
    });
  });

  test('clears input after sending message', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'Response' })
    });

    render(<ChatWidget />);
    
    const input = screen.getByPlaceholderText('Ask me about your inventory...');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  test('handles API error gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ChatWidget />);
    
    const input = screen.getByPlaceholderText('Ask me about your inventory...');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Sorry, there was an error/)).toBeInTheDocument();
    });
  });

  test('handles API response with error status', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' })
    });

    render(<ChatWidget />);
    
    const input = screen.getByPlaceholderText('Ask me about your inventory...');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Sorry, there was an error/)).toBeInTheDocument();
    });
  });

  test('displays multiple messages in conversation', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'First response' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'Second response' })
      });

    render(<ChatWidget />);
    
    const input = screen.getByPlaceholderText('Ask me about your inventory...');
    const sendButton = screen.getByTestId('send-button');
    
    // Send first message
    fireEvent.change(input, { target: { value: 'First question' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('First question')).toBeInTheDocument();
      expect(screen.getByText('First response')).toBeInTheDocument();
    });
    
    // Send second message
    fireEvent.change(input, { target: { value: 'Second question' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Second question')).toBeInTheDocument();
      expect(screen.getByText('Second response')).toBeInTheDocument();
    });
  });

  test('shows tooltip on disabled send button', async () => {
    render(<ChatWidget />);
    
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.mouseEnter(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Type a message to send')).toBeInTheDocument();
    });
  });

  test('shows tooltip on enabled send button', async () => {
    render(<ChatWidget />);
    
    const input = screen.getByPlaceholderText('Ask me about your inventory...');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.mouseEnter(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Send message')).toBeInTheDocument();
    });
  });

  test('handles very long messages', async () => {
    const longMessage = 'A'.repeat(1000);
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'Response to long message' })
    });

    render(<ChatWidget />);
    
    const input = screen.getByPlaceholderText('Ask me about your inventory...');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: longMessage } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/AAAAAAA/)).toBeInTheDocument();
    });
  });

  test('handles special characters in messages', async () => {
    const specialMessage = 'How many émojis 🎉 & spéçial chars @#$%^&*() do we have?';
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'Special characters handled correctly' })
    });

    render(<ChatWidget />);
    
    const input = screen.getByPlaceholderText('Ask me about your inventory...');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: specialMessage } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });
  });

  test('maintains focus on input after sending message', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'Response' })
    });

    render(<ChatWidget />);
    
    const input = screen.getByPlaceholderText('Ask me about your inventory...');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(input).toHaveFocus();
    });
  });

  test('scrolls to bottom when new message is added', async () => {
    // Mock scrollIntoView
    const mockScrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = mockScrollIntoView;

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'Response' })
    });

    render(<ChatWidget />);
    
    const input = screen.getByPlaceholderText('Ask me about your inventory...');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(mockScrollIntoView).toHaveBeenCalled();
    });
  });
});
