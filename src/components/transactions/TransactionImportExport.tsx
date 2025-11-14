import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Upload, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  X,
  Info,
  FileUp
} from 'lucide-react';
import { 
  Transaction, 
  transactionService, 
  BulkImportResponse,
  CSVTransactionData
} from '@/services/transactionService';
import { Category } from '@/services/categoryService';
import { toast } from 'sonner';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TransactionImportExportProps {
  transactions: Transaction[];
  categories: Category[];
  onImportComplete: () => void;
}

const TransactionImportExport: React.FC<TransactionImportExportProps> = ({ 
  transactions, 
  categories,
  onImportComplete
}) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<BulkImportResponse | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedData, setParsedData] = useState<CSVTransactionData[] | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  // Create a map of category IDs to names
  const categoryMap: Record<string, string> = {};
  categories.forEach(category => {
    categoryMap[category.id] = category.name;
  });

  const handleExportCSV = () => {
    try {
      // Generate CSV content
      const csvContent = transactionService.exportToCSV(transactions, categoryMap);
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      // Trigger download and clean up
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Transactions exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export transactions');
    }
  };

  const processFile = (file: File) => {
    // Reset states
    setParsedData(null);
    setImportResult(null);
    setCsvError(null);
    
    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = transactionService.parseCSV(content);
        setParsedData(parsed);
      } catch (error) {
        setCsvError((error as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    const file = files[0];
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setCsvError('Please drop a CSV file');
      return;
    }
    
    processFile(file);
  }, []);

  const handleImport = async () => {
    if (!parsedData || parsedData.length === 0) {
      toast.error('No valid data to import');
      return;
    }

    try {
      setIsImporting(true);
      
      // Convert parsed data back to CSV for server processing
      const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
      const rows = parsedData.map(data => [
        data.date,
        data.type,
        data.category,
        data.description ?? "", // Use nullish coalescing to handle undefined description
        data.amount.toString()
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Send to server
      const result = await transactionService.importFromCSV(csvContent);
      setImportResult(result);
      
      // Show success or partial success message
      if (result.importedCount > 0) {
        if (result.failedRows.length > 0) {
          toast.warning(`Imported ${result.importedCount} transactions with ${result.failedRows.length} errors`);
        } else {
          toast.success(`Successfully imported ${result.importedCount} transactions`);
        }
        
        // Force refresh the transactions list with a small delay to ensure server calculations complete
        setTimeout(() => {
          onImportComplete();
        }, 500);
      } else {
        toast.error('No transactions were imported');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import transactions');
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setParsedData(null);
    setImportResult(null);
    setCsvError(null);
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setTimeout(resetImport, 300); // Reset after modal close animation
  };

  return (
    <>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => setIsImportModalOpen(true)}
        >
          <Upload className="h-4 w-4" />
          Import
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleExportCSV}
          disabled={transactions.length === 0}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Dialog open={isImportModalOpen} onOpenChange={closeImportModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Transactions</DialogTitle>
            <DialogDescription>
              Upload a CSV file with transaction data. New categories will be created automatically.
            </DialogDescription>
          </DialogHeader>

          {/* CSV Format Info */}
          <Alert variant="info" className="" style={{backgroundColor: 'var(--heritage-cream)'}}>
            <Info className="h-4 w-4" />
            <AlertTitle>Required CSV Format</AlertTitle>
            <AlertDescription>
              Your CSV file must include these columns: Date, Type, Category, Amount.
              Description is optional. The Type must be either "income" or "expense".
            </AlertDescription>
          </Alert>

          {/* File Input */}
          {!importResult && (
            <div className="space-y-4">
              {/* Drag & Drop Zone */}
              <div 
                ref={dropZoneRef}
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <FileUp className={`h-8 w-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="text-sm font-medium">
                    {isDragging ? 'Drop CSV file here' : 'Drag and drop your CSV file here'}
                  </div>
                  <div className="text-xs text-muted-foreground">or</div>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={isImporting}
                    className="max-w-xs"
                  />
                </div>
              </div>

              {csvError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{csvError}</AlertDescription>
                </Alert>
              )}

              {parsedData && parsedData.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Preview ({parsedData.length} transactions)</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2 text-left">Date</th>
                          <th className="p-2 text-left">Type</th>
                          <th className="p-2 text-left">Category</th>
                          <th className="p-2 text-left">Description</th>
                          <th className="p-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {parsedData.slice(0, 5).map((item, i) => (
                          <tr key={i} className="hover:bg-muted/50">
                            <td className="p-2">{item.date}</td>
                            <td className="p-2 capitalize">{item.type}</td>
                            <td className="p-2">{item.category}</td>
                            <td className="p-2">{item.description}</td>
                            <td className="p-2 text-right">
                              <span className={item.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {parsedData.length > 5 && (
                          <tr>
                            <td colSpan={5} className="p-2 text-center text-muted-foreground">
                              ... and {parsedData.length - 5} more transactions
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium">Import Complete</h3>
                  <p className="text-sm text-muted-foreground">
                    Successfully imported {importResult.importedCount} transactions
                  </p>
                </div>
              </div>

              {importResult.createdCategories.length > 0 && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="new-categories">
                    <AccordionTrigger className="text-sm">
                      {importResult.createdCategories.length} New Categories Created
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1 text-sm">
                        {importResult.createdCategories.map((category, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {category}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {importResult.failedRows.length > 0 && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="errors">
                    <AccordionTrigger className="text-sm">
                      {importResult.failedRows.length} Errors
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        {importResult.failedRows.map((failure, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 rounded bg-red-50 dark:bg-red-950">
                            <X className="h-3 w-3 mt-1 text-red-500 shrink-0" />
                            <div>
                              <span className="font-medium">Row {failure.rowIndex}: </span>
                              {failure.error}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          )}

          <DialogFooter>
            {!importResult ? (
              <>
                <Button variant="outline" onClick={closeImportModal}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={!parsedData || parsedData.length === 0 || isImporting}
                >
                  {isImporting ? 'Importing...' : 'Import'}
                </Button>
              </>
            ) : (
              <Button onClick={closeImportModal}>Done</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransactionImportExport; 