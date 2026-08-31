import React, { useState } from 'react';
import { FileUp, FileText, CheckCircle2, AlertCircle, Clock, Search } from 'lucide-react';
import type { DocumentMeta, Session } from '../types';
import { api } from '../services/api';

interface DocumentManagerProps {
  currentSession: Session | null;
  documents: DocumentMeta[];
  onDocumentUploaded: (newDoc: DocumentMeta) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  currentSession,
  documents,
  onDocumentUploaded,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [filingType, setFilingType] = useState('10-K');
  const [fiscalYear, setFiscalYear] = useState('FY2023');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!companyName) {
        // Auto-fill company name guess from filename
        const cleanName = file.name.split('_')[0].split('-')[0];
        setCompanyName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession || !selectedFile || !companyName) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const newDoc = await api.uploadDocument(
        currentSession.session_id,
        selectedFile,
        companyName,
        filingType,
        fiscalYear
      );
      onDocumentUploaded(newDoc);
      setSelectedFile(null);
      setCompanyName('');
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || 'Failed to upload and index document.');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredDocs = documents.filter(
    (doc) =>
      doc.company_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              A1
            </span>
            <h2 className="text-xl font-bold text-slate-900">Document Agent Workspace</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated ingestion, parsing, chunking, and ChromaDB vector indexing with exact source attribution.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500">
            Current Workspace: <strong className="text-slate-800">{currentSession?.title || 'None Selected'}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Upload New Filing Form */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm h-fit">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileUp className="w-4 h-4 text-indigo-600" />
            Upload Financial Document
          </h3>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {uploadError && (
              <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                placeholder="e.g. NVIDIA Corp."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Filing Type</label>
                <select
                  value={filingType}
                  onChange={(e) => setFilingType(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-500"
                >
                  <option value="10-K">Form 10-K (Annual)</option>
                  <option value="10-Q">Form 10-Q (Quarterly)</option>
                  <option value="Annual Report">Annual Report</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fiscal Year</label>
                <input
                  type="text"
                  placeholder="e.g. FY2024"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PDF Filing Document</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                required
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading || !selectedFile || !companyName}
              className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Parsing & Vector Indexing...</span>
                </>
              ) : (
                <>
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Index Document</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Indexed Documents List */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Indexed Seed & User Filings</h3>
                <p className="text-xs text-slate-500">
                  {filteredDocs.length} filings available in this research workspace.
                </p>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter documents..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-slate-900 outline-none focus:border-indigo-500 w-full sm:w-48"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2">Company</th>
                    <th className="pb-3">Type / Year</th>
                    <th className="pb-3">File Name</th>
                    <th className="pb-3">Pages</th>
                    <th className="pb-3 pr-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No filings found. Upload a PDF or switch workspace.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => (
                      <tr key={doc.document_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 pl-2 font-bold text-slate-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span>{doc.company_name}</span>
                        </td>
                        <td className="py-3">
                          <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                            {doc.filing_type} • {doc.fiscal_year || 'FY23'}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 font-mono text-[11px] max-w-[150px] truncate">
                          {doc.file_name}
                        </td>
                        <td className="py-3 font-semibold text-slate-800">
                          {doc.total_pages} {doc.total_pages === 1 ? 'page' : 'pages'}
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Indexed</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Vector Store: ChromaDB Persistent</span>
            <span>Grounding: 100% Citation Backed</span>
          </div>
        </div>

      </div>

    </div>
  );
};