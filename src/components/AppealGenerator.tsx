import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Download, Send, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from 'framer-motion';
import { db } from '@/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import jsPDF from 'jspdf';

export const AppealGenerator = ({ violation, analysisResult, onBack }) => {
  const [customNotes, setCustomNotes] = useState('');
  const [appealLetter, setAppealLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [hasAppeal, setHasAppeal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkExistingAppeal = async () => {
      const appealsRef = collection(db, 'appeals');
      const q = query(appealsRef, where('violationId', '==', violation.id));
      const querySnapshot = await getDocs(q);
      setHasAppeal(!querySnapshot.empty);
    };
    checkExistingAppeal();
  }, [violation.id]);

  const generateAppealLetter = () => {
    setIsGenerating(true);
    
    // Simulate AI letter generation
    setTimeout(() => {
      const letterTemplate = `
PORMAL NA APELA PARA SA TRAFFIC VIOLATION

Petsa: ${new Date().toLocaleDateString('en-PH')}

Sa: Traffic Violation Review Office
     ${violation.location.split(',')[1] || 'Local Government Unit'}

Paksa: Appeal para sa Traffic Violation Ticket ${violation.ticketNumber}

Mahal na mga Opisyal,

Ako po ay nais mag-file ng formal appeal para sa traffic violation ticket na natanggap ko noong ${new Date(violation.date).toLocaleDateString('en-PH')} sa ${violation.location}.

DETALYE NG VIOLATION:
- Ticket Number: ${violation.ticketNumber}
- Violation Type: ${violation.violationType}
- Plate Number: ${violation.plateNumber}
- Fine Amount: ₱${violation.fine.toLocaleString()}

DAHILAN NG APELA:
Batay sa AI analysis na ginawa gamit ang advanced image recognition technology, natuklasan ang mga sumusunod na issues:

${analysisResult.issues.map(issue => `• ${issue}`).join('\n')}

AI ANALYSIS RESULTS:
- Verdict: ${analysisResult.verdict === 'unfair' ? 'Possibly Unfair Violation' : 'Valid Violation'}
- Confidence Level: ${analysisResult.confidence}%
- Image Quality Assessment: ${analysisResult.imageQuality}
- Plate Number Verification: ${analysisResult.plateNumberMatch ? 'Verified' : 'Unverified'}

${customNotes ? `\nDAGDAG NA IMPORMASYON:\n${customNotes}` : ''}

Sa kadahilanang ito, hinihiling ko po ang inyong consideration para sa dismissal ng violation ticket na ito. Nakaattach po ang mga supporting documents at evidence.

Maraming salamat sa inyong oras at consideration.

Taos-pusong nagmamakaawa,

_____________________
[Inyong Pangalan]
[Contact Information]
[Petsa]

ATTACHMENTS:
- Original Ticket Photo/Document
- AI Analysis Report
- Supporting Evidence (if any)
      `.trim();

      setAppealLetter(letterTemplate);
      setIsGenerating(false);
    }, 2000);
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(appealLetter);
    toast({
      title: "Appeal letter copied",
      description: "The letter has been copied to your clipboard",
    });
  };

  const handleSubmitAppeal = async () => {
    if (hasAppeal) {
      toast({
        title: 'Appeal already exists',
        description: 'This violation already has an appeal under review.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const appealsRef = collection(db, 'appeals');
      await addDoc(appealsRef, {
        violationId: violation.id,
        plateNumber: violation.plateNumber,
        violationType: violation.violationType,
        location: violation.location,
        date: violation.date,
        fine: violation.fine,
        status: 'pending',
        analysisResult,
        submittedDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update violation status
      const violationRef = doc(db, 'violations', violation.id);
      await updateDoc(violationRef, {
        status: 'under_review',
        updatedAt: serverTimestamp()
      });

      toast({
        title: 'Appeal submitted',
        description: 'Your appeal has been sent to the LGU for review.'
      });
      onBack();
    } catch (err) {
      toast({
        title: 'Error submitting appeal',
        description: 'There was an error submitting your appeal. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica');
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(appealLetter, 180);
    doc.text(lines, 15, 20);
    doc.save(`Appeal_Letter_${violation.plateNumber}_${violation.ticketNumber}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-primary hover:text-primary/80 hover:bg-transparent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Violation
        </Button>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Generate Appeal</CardTitle>
            <CardDescription className="text-destructive">
              Review the AI analysis and submit your appeal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Analysis Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Badge variant={analysisResult.verdict === 'unfair' ? 'destructive' : 'default'}>
                        {analysisResult.verdict === 'unfair' ? 'Possibly Unfair' : 'Valid Violation'}
                      </Badge>
                      <span className="ml-2 text-sm text-gray-600">
                        AI Confidence: {analysisResult.confidence}%
                      </span>
                    </div>
                  </div>
                  
                  {analysisResult.issues.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Issues Found:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {analysisResult.issues.map((issue, index) => (
                          <li key={index} className="text-red-600">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Custom Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                  <CardDescription>
                    Magdagdag ng inyong personal na explanation o context (optional)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Halimbawa: Ako ay nasa emergency situation noon, o may road construction na hindi nakita sa violation photo..."
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Generate Letter */}
            {!appealLetter && (
              <div className="text-center py-8">
                <Button
                  onClick={generateAppealLetter}
                  disabled={isGenerating}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <FileText className="h-5 w-5 mr-2 animate-pulse" />
                      Ginagawa ang Appeal Letter...
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5 mr-2" />
                      Generate Appeal Letter
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Generated Letter */}
            {appealLetter && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Appeal Letter</CardTitle>
                    <CardDescription>
                      AI-generated formal appeal letter na pwede ninyong i-submit sa LGU
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {appealLetter}
                      </pre>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={handleCopyLetter} variant="outline">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Letter
                      </Button>
                      <Button variant="outline" onClick={handleDownloadPDF}>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button
                        onClick={handleSubmitAppeal}
                        disabled={isSubmitting || hasAppeal}
                        className="w-full h-12 bg-primary hover:bg-primary/80 text-white"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Submitting appeal...</span>
                          </div>
                        ) : hasAppeal ? (
                          'Appeal Already Submitted'
                        ) : (
                          'Submit Appeal'
                        )}
                      </Button>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p><strong>Next Steps:</strong></p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>I-download ang letter as PDF</li>
                        <li>I-print at i-sign ang letter</li>
                        <li>I-attach ang original ticket at supporting documents</li>
                        <li>I-submit sa proper LGU office o online portal</li>
                        <li>Mag-antay ng response (usually 15-30 days)</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
