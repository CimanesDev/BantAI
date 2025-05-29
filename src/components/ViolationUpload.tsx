import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Camera, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { db, storage } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const ViolationUpload = ({ onBack, user }) => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    violationType: '',
    location: '',
    date: '',
    notes: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState('');
  const inputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } }) => {
    setFileError('');
    const files = Array.from(event.target.files as FileList);
    const validFiles = files.filter(file => {
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        setFileError('Only JPG, PNG, and PDF files are allowed.');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFileError('Each file must be less than 5MB.');
        return false;
      }
      return true;
    });
    if (validFiles.length) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      toast({
        title: "File uploaded successfully",
        description: `${validFiles.length} file(s) added`,
      });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Not logged in', description: 'You must be logged in to upload a violation.' });
      return;
    }
    setIsSubmitting(true);
    try {
      // Upload files to Firebase Storage
      const fileUrls = [];
      for (const file of uploadedFiles) {
        const storageRef = ref(storage, `violations/${user.id}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        fileUrls.push(url);
      }
      // Add violation to Firestore
      await addDoc(collection(db, 'violations'), {
        userId: user.id,
        plateNumber: formData.plateNumber,
        violationType: formData.violationType,
        location: formData.location,
        date: formData.date,
        notes: formData.notes,
        fileUrls,
        createdAt: serverTimestamp(),
        status: 'unpaid',
      });
      toast({ title: 'Violation uploaded successfully', description: 'AI analysis will begin shortly...' });
      setFormData({ plateNumber: '', violationType: '', location: '', date: '', notes: '' });
      setUploadedFiles([]);
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-4"
      >
        <Button variant="ghost" onClick={onBack} className="text-[#0d3b86] hover:text-[#0d3b86]/80">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Bumalik
        </Button>
        <h2 className="text-2xl font-bold text-[#0d3b86]">Upload Traffic Violation</h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-[#0d3b86]/10 bg-[#fcf9f6] backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-xl text-[#0d3b86]">Ticket Information</CardTitle>
            <CardDescription className="text-[#0d3b86]/80">
              Punan ang detalye ng iyong traffic violation ticket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plateNumber">Plate Number</Label>
                  <Input
                    id="plateNumber"
                    value={formData.plateNumber}
                    onChange={(e) => setFormData({...formData, plateNumber: e.target.value})}
                    placeholder="ABC-1234"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="violationType">Violation Type</Label>
                  <Input
                    id="violationType"
                    value={formData.violationType}
                    onChange={(e) => setFormData({...formData, violationType: e.target.value})}
                    placeholder="e.g., Illegal Parking"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., EDSA, Quezon City"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date of Violation</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Dagdag na impormasyon tungkol sa violation..."
                  rows={3}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${dragActive ? 'border-[#0d3b86] bg-[#0d3b86]/10' : 'border-[#0d3b86]/30 bg-[#fcf9f6]'}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <FileImage className="h-12 w-12 mx-auto text-[#0d3b86] mb-4" />
                  <h3 className="text-lg font-medium text-[#0d3b86] mb-2">
                    Upload Ticket Photos
                  </h3>
                  <p className="text-sm text-[#0d3b86]/70 mb-4">
                    Mag-upload ng larawan ng ticket, violation letter, o anumang dokumento (JPG, PNG, PDF, max 5MB)
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" className="border-[#0d3b86] text-[#0d3b86] hover:bg-[#0d3b86]/10" onClick={() => inputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Files
                      </Button>
                    </Label>
                    <Button type="button" variant="outline" className="border-[#0d3b86] text-[#0d3b86] hover:bg-[#0d3b86]/10">
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                  <Input
                    id="file-upload"
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {fileError && <p className="text-[#b61c24] text-sm mt-2">{fileError}</p>}
                </div>
                {uploadedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-4"
                  >
                    <h4 className="font-medium mb-2 text-[#0d3b86]">Uploaded Files:</h4>
                    <div className="space-y-1">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="text-sm text-[#0d3b86] flex items-center gap-2">
                          <span>📎</span> <span>{file.name}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex justify-end"
              >
                <Button type="submit" className="bg-[#0d3b86] hover:bg-[#0d3b86]/90 text-white" disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading...' : 'Submit for AI Analysis'}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
