import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Brain, Eye, Scale, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { motion } from 'framer-motion';
import { useLanguage } from "@/contexts/LanguageContext";

export const AIAnalysis = ({ violation, onAnalysisComplete, onBack }) => {
  const [analysisStep, setAnalysisStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState(null);
  const { t } = useLanguage();

  const analysisSteps = [
    { icon: Eye, title: "Scanning Image", description: "Ginagamit ang Gemini Vision AI para basahin ang ticket" },
    { icon: Brain, title: "Extracting Information", description: "Kinukuha ang plate number, location, at iba pang detalye" },
    { icon: Scale, title: "Analyzing Fairness", description: "Sinusuri kung makatarungan ang violation" },
    { icon: FileText, title: "Generating Report", description: "Ginagawa ang comprehensive analysis report" }
  ];

  // Simulate AI analysis process
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          generateMockResult();
          setIsComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    const stepTimer = setInterval(() => {
      setAnalysisStep(prev => {
        if (prev >= analysisSteps.length - 1) {
          clearInterval(stepTimer);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, []);

  const generateMockResult = () => {
    // Mock AI analysis result - in real app this would come from Gemini API
    const mockResult = {
      verdict: Math.random() > 0.5 ? 'unfair' : 'valid',
      confidence: Math.floor(Math.random() * 30) + 70,
      plateNumberMatch: Math.random() > 0.3,
      imageQuality: Math.random() > 0.2 ? 'good' : 'poor',
      violationDetails: {
        extractedPlate: violation.plateNumber,
        extractedLocation: violation.location,
        extractedTime: "14:32",
        weatherConditions: "Clear"
      },
      issues: [],
      recommendations: []
    };

    // Add issues based on verdict
    if (mockResult.verdict === 'unfair') {
      if (!mockResult.plateNumberMatch) {
        mockResult.issues.push("Plate number hindi clear sa larawan");
      }
      if (mockResult.imageQuality === 'poor') {
        mockResult.issues.push("Malabo ang larawan ng violation");
      }
      mockResult.issues.push("Walang clear na violation na nakita");
      mockResult.recommendations = [
        "Mag-file ng formal appeal",
        "Mag-request ng clearer evidence",
        "Kumuha ng legal assistance"
      ];
    } else {
      mockResult.recommendations = [
        "Bayaran ang fine o mag-file ng appeal kung may valid reason",
        "I-review ang traffic rules para sa future"
      ];
    }

    setResult(mockResult);
  };

  const getVerdictDisplay = (verdict, confidence) => {
    const verdictConfig = {
      valid: {
        icon: CheckCircle,
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Valid Violation",
        description: "Ang violation ay tama at makatarungan"
      },
      unfair: {
        icon: XCircle,
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Possibly Unfair",
        description: "May mga issue na nakita sa violation"
      },
      uncertain: {
        icon: AlertTriangle,
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Uncertain",
        description: "Kailangan ng further review"
      }
    };

    const config = verdictConfig[verdict] || verdictConfig.uncertain;
    const Icon = config.icon;

    return (
      <div className={`border-2 rounded-lg p-4 ${config.color}`}>
        <div className="flex items-center space-x-3">
          <Icon className="h-8 w-8" />
          <div>
            <h3 className="text-lg font-bold">{config.label}</h3>
            <p className="text-sm">{config.description}</p>
            <p className="text-xs mt-1">AI Confidence: {confidence}%</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Bumalik
        </Button>
        <h2 className="text-2xl font-bold">AI Violation Analysis</h2>
      </div>

      {/* Violation Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Violation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Ticket:</strong> {violation.ticketNumber}</div>
              <div><strong>Type:</strong> {violation.violationType}</div>
              <div><strong>Location:</strong> {violation.location}</div>
              <div><strong>Date:</strong> {new Date(violation.date).toLocaleDateString('en-PH')}</div>
              <div><strong>Plate:</strong> {violation.plateNumber}</div>
              <div><strong>Fine:</strong> ₱{violation.fine.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Analysis Progress */}
      {!isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 animate-pulse" />
                <span>AI Analysis in Progress</span>
              </CardTitle>
              <CardDescription>
                Ginagamit ang Gemini Vision AI para i-analyze ang inyong violation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress} className="w-full" />
              <div className="space-y-3">
                {analysisSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === analysisStep;
                  const isComplete = index < analysisStep;
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive ? 'bg-blue-50 border-l-4 border-blue-500' : 
                        isComplete ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${
                        isActive ? 'text-blue-600 animate-pulse' :
                        isComplete ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium">{step.title}</div>
                        <div className="text-sm text-gray-600">{step.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Analysis Results */}
      {isComplete && result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis Results</CardTitle>
              <CardDescription>
                Completed analysis using Gemini Vision AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getVerdictDisplay(result.verdict, result.confidence)}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Extracted Information</h4>
                  <div className="space-y-1 text-sm">
                    <div>Plate Number: {result.violationDetails.extractedPlate}</div>
                    <div>Location: {result.violationDetails.extractedLocation}</div>
                    <div>Time: {result.violationDetails.extractedTime}</div>
                    <div>Weather: {result.violationDetails.weatherConditions}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Quality Checks</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center space-x-2">
                      <Badge variant={result.plateNumberMatch ? "default" : "destructive"}>
                        {result.plateNumberMatch ? "✓" : "✗"}
                      </Badge>
                      <span>Plate Number Match</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={result.imageQuality === 'good' ? "default" : "destructive"}>
                        {result.imageQuality === 'good' ? "✓" : "✗"}
                      </Badge>
                      <span>Image Quality</span>
                    </div>
                  </div>
                </div>
              </div>

              {result.issues.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">Issues Found</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.issues.map((issue, index) => (
                      <li key={index} className="text-red-600">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {result.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button 
              onClick={() => onAnalysisComplete(result)}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-5 w-5 mr-2" />
              Generate Appeal Letter
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
