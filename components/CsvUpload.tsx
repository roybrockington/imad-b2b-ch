'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { api, Product } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';

interface CsvUploadProps {
  onSuccess?: () => void;
  userCurrency: string;
  userAccount: any;
}

export default function CsvUpload({ onSuccess, userCurrency, userAccount }: CsvUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [notFoundItems, setNotFoundItems] = useState<Array<{ code: string; quantity: number }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useCart();

  const generateTemplate = () => {
    // Use semicolon for non-UK/GB regions, comma for UK/GB
    const isUKRegion = userAccount?.region?.code?.toLowerCase() === 'uk' ||
                       userAccount?.region?.code?.toLowerCase() === 'gb';
    const separator = isUKRegion ? ',' : ';';
    const csvContent = `item${separator}quantity\n10005658${separator}5\n10007200${separator}10`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'cart_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsv = (text: string): Array<{ code: string; quantity: number }> => {
    const lines = text.split('\n').filter(line => line.trim());
    const items: Array<{ code: string; quantity: number }> = [];

    // Auto-detect separator from first line (header)
    let separator = ',';
    if (lines.length > 0) {
      const headerLine = lines[0];
      // If semicolon is present and comma is not, use semicolon
      if (headerLine.includes(';') && !headerLine.includes(',')) {
        separator = ';';
      }
      // If both are present, prefer semicolon for non-UK regions
      else if (headerLine.includes(';') && headerLine.includes(',')) {
        const isUKRegion = userAccount?.region?.code?.toLowerCase() === 'uk' ||
                           userAccount?.region?.code?.toLowerCase() === 'gb';
        separator = isUKRegion ? ',' : ';';
      }
    }

    // Skip header row (first line)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split by detected separator, but handle potential quotes
      const parts = line.split(separator).map(part => part.trim().replace(/^["']|["']$/g, ''));

      if (parts.length >= 2) {
        const code = parts[0];
        const quantity = parseInt(parts[1], 10);

        if (code && !isNaN(quantity) && quantity > 0) {
          items.push({ code, quantity });
        }
      }
    }

    return items;
  };

  const calculatePrice = (product: Product): string => {
    if (!userAccount) return product.trade_eu;

    const currency = userAccount.currency?.code || 'EUR';
    let basePrice = '0.00';

    // Select base price based on currency
    switch (currency) {
      case 'PLN':
        basePrice = product.trade_pl;
        break;
      case 'CZK':
        basePrice = product.trade_cz;
        break;
      case 'GBP':
        basePrice = product.trade_uk || product.trade_eu;
        break;
      default:
        basePrice = product.trade_eu;
    }

    // Apply discounts if available
    const price = parseFloat(basePrice.replace(/\s/g, '').replace(',', '.'));
    let discount = parseFloat(userAccount.discount || '0');

    // Check for brand-specific discounts
    if (userAccount.discounts) {
      const brandDiscount = userAccount.discounts.find(
        (d: any) => d.brand_id === product.brand_id
      );
      if (brandDiscount && brandDiscount.auth) {
        discount = Math.max(discount, parseFloat(brandDiscount.discount));
      }
    }

    // Check for category-specific discounts
    if (userAccount.category_discounts) {
      const categoryDiscount = userAccount.category_discounts.find(
        (d: any) => d.category_id === product.category_id && d.brand_id === product.brand_id
      );
      if (categoryDiscount && categoryDiscount.auth) {
        discount = Math.max(discount, parseFloat(categoryDiscount.discount));
      }
    }

    const discountedPrice = price * (1 - discount / 100);

    // Format price based on currency
    if (currency === 'GBP') {
      // British format: use dot as decimal separator
      return discountedPrice.toFixed(2);
    } else {
      // European format: use comma as decimal separator
      return discountedPrice.toFixed(2).replace('.', ',');
    }
  };

  const processFile = async (file: File) => {
    // Reset states
    setError(null);
    setSuccess(null);
    setNotFoundItems([]);
    setUploading(true);

    try {
      // Validate file type
      if (!file.name.endsWith('.csv')) {
        throw new Error('Please upload a CSV file');
      }

      // Read file
      const text = await file.text();
      const items = parseCsv(text);

      if (items.length === 0) {
        throw new Error('No valid items found in CSV file. Please ensure the file has the correct format.');
      }

      // Process with backend
      const result = await api.processCsvImport(items);

      // Add found products to cart
      let addedCount = 0;
      // Use currency from account, fallback to userCurrency prop
      const currency = userAccount?.currency?.code || userCurrency;
      for (const { product, quantity } of result.found) {
        const price = calculatePrice(product);
        addItem(product, quantity, price, currency);
        addedCount++;
      }

      // Report results
      if (result.not_found.length > 0) {
        setNotFoundItems(result.not_found);
        setSuccess(`Added ${addedCount} item(s) to cart. ${result.not_found.length} item(s) not found.`);
      } else {
        setSuccess(`Successfully added ${addedCount} item(s) to cart!`);
      }

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('CSV import error:', err);
      setError(err.message || 'Failed to process CSV file. Please check the format and try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    if (uploading) return;

    const file = event.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <Upload className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Bulk Import from CSV</h3>
          <p className="text-sm text-gray-600 mb-3">
            Upload a CSV file to add multiple items to your cart at once
          </p>

          {/* Template Download */}
          <button
            onClick={generateTemplate}
            className="inline-flex items-center gap-2 text-sm text-brand hover:text-brand/80 transition-colors mb-4"
          >
            <Download className="w-4 h-4" />
            Download CSV Template
          </button>

          {/* File Upload with Drag & Drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 transition-all ${
              isDragging
                ? 'border-brand bg-brand/5 scale-[1.02]'
                : 'border-gray-300 bg-white'
            } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
              id="csv-upload"
            />

            <div className="text-center">
              <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragging ? 'text-brand' : 'text-gray-400'}`} />
              <p className="text-sm text-gray-600 mb-2">
                {isDragging ? (
                  <span className="text-brand font-semibold">Drop your CSV file here</span>
                ) : (
                  <>Drag and drop your CSV file here, or</>
                )}
              </p>
              <label
                htmlFor="csv-upload"
                className={`inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg font-semibold cursor-pointer transition-colors ${
                  uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand/90'
                }`}
              >
                <FileText className="w-4 h-4" />
                {uploading ? 'Processing...' : 'Choose CSV File'}
              </label>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Not Found Items */}
          {notFoundItems.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-yellow-800">
                  The following items were not found:
                </p>
              </div>
              <ul className="ml-7 text-sm text-yellow-700 space-y-1">
                {notFoundItems.map((item, index) => (
                  <li key={index}>
                    {item.code} (Qty: {item.quantity})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Format Instructions */}
          <div className="mt-4 text-xs text-gray-500">
            <p className="font-semibold mb-1">CSV Format:</p>
            {(() => {
              const isUKRegion = userAccount?.region?.code?.toLowerCase() === 'uk' ||
                                 userAccount?.region?.code?.toLowerCase() === 'gb';
              const separator = isUKRegion ? ',' : ';';
              const separatorName = isUKRegion ? 'comma' : 'semicolon';
              return (
                <ul className="list-disc list-inside space-y-0.5">
                  <li>First row: headers (item{separator} quantity)</li>
                  <li>Following rows: product code and quantity separated by {separatorName}</li>
                  <li>Example: 10005658{separator}5</li>
                </ul>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
