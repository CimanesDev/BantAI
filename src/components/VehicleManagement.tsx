import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { motion } from 'framer-motion';
import { db } from '@/firebase';
import { doc, collection, addDoc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  brand: string;
  model: string;
  year: string;
  userId: string;
}

interface VehicleManagementProps {
  user: any;
  onVehiclesUpdate: (vehicles: Vehicle[]) => void;
}

export const VehicleManagement = ({ user, onVehiclesUpdate }: VehicleManagementProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    plateNumber: '',
    type: '',
    brand: '',
    model: '',
    year: ''
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (user) {
      fetchVehicles();
    }
  }, [user]);

  const fetchVehicles = async () => {
    try {
      const vehiclesRef = collection(db, 'vehicles');
      const q = query(vehiclesRef, where('userId', '==', user.id));
      const querySnapshot = await getDocs(q);
      const vehiclesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vehicle[];
      setVehicles(vehiclesData);
      onVehiclesUpdate(vehiclesData);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vehicles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Normalization helper
  const normalizePlate = (plate: string) => plate.trim().toUpperCase().replace(/\s+/g, '');

  const handleAddVehicle = async () => {
    if (!newVehicle.plateNumber || !newVehicle.type || !newVehicle.brand || !newVehicle.model || !newVehicle.year) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const vehicleData = {
        plateNumber: normalizePlate(newVehicle.plateNumber),
        type: newVehicle.type,
        brand: newVehicle.brand,
        model: newVehicle.model,
        year: newVehicle.year,
        userId: user.id
      };

      const docRef = await addDoc(collection(db, 'vehicles'), vehicleData);
      const newVehicleWithId = { ...vehicleData, id: docRef.id };
      setVehicles(prev => [...prev, newVehicleWithId]);
      onVehiclesUpdate([...vehicles, newVehicleWithId]);
      setNewVehicle({
        plateNumber: '',
        type: '',
        brand: '',
        model: '',
        year: ''
      });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Vehicle added successfully"
      });
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to add vehicle",
        variant: "destructive"
      });
    }
  };

  const handleEditVehicle = async () => {
    if (!selectedVehicle) return;

    try {
      const vehicleRef = doc(db, 'vehicles', selectedVehicle.id);
      await updateDoc(vehicleRef, {
        plateNumber: normalizePlate(selectedVehicle.plateNumber),
        type: selectedVehicle.type,
        brand: selectedVehicle.brand,
        model: selectedVehicle.model,
        year: selectedVehicle.year
      });

      setVehicles(prev =>
        prev.map(vehicle =>
          vehicle.id === selectedVehicle.id
            ? { ...selectedVehicle, plateNumber: normalizePlate(selectedVehicle.plateNumber) }
            : vehicle
        )
      );
      onVehiclesUpdate(vehicles.map(v => v.id === selectedVehicle.id ? { ...selectedVehicle, plateNumber: normalizePlate(selectedVehicle.plateNumber) } : v));
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Vehicle updated successfully"
      });
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to update vehicle",
        variant: "destructive"
      });
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'vehicles', id));
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
      onVehiclesUpdate(vehicles.filter(v => v.id !== id));
      toast({
        title: "Success",
        description: "Vehicle deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to delete vehicle",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-4"
      >
        <h2 className="text-2xl font-bold text-primary">{t('vehicleManagement.title')}</h2>
      </motion.div>
      <div
        className="bg-card/80 backdrop-blur-lg border border-primary/10 rounded-2xl shadow-lg p-6"
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-blue-900">{t('vehicleManagement.myVehicles')}</h2>
              <p className="text-blue-600">{t('vehicleManagement.manageRegisteredVehicles')}</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('vehicleManagement.addVehicle')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-blue-900">{t('vehicleManagement.addNewVehicle')}</DialogTitle>
                  <DialogDescription className="text-blue-600">
                    {t('vehicleManagement.enterVehicleDetailsBelow')}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="plateNumber" className="text-right text-blue-900">
                      {t('vehicleManagement.plateNumber')}
                    </Label>
                    <Input
                      id="plateNumber"
                      value={newVehicle.plateNumber}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, plateNumber: e.target.value }))}
                      className="col-span-3 border-blue-200 focus:border-blue-400"
                      placeholder="e.g. ABC-1234"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right text-blue-900">
                      {t('vehicleManagement.type')}
                    </Label>
                    <Select
                      value={newVehicle.type}
                      onValueChange={(value) => setNewVehicle(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger className="col-span-3 border-blue-200 focus:border-blue-400">
                        <SelectValue placeholder={t('vehicleManagement.selectVehicleType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sedan">{t('vehicleManagement.sedan')}</SelectItem>
                        <SelectItem value="SUV">{t('vehicleManagement.suv')}</SelectItem>
                        <SelectItem value="Truck">{t('vehicleManagement.truck')}</SelectItem>
                        <SelectItem value="Van">{t('vehicleManagement.van')}</SelectItem>
                        <SelectItem value="Motorcycle">{t('vehicleManagement.motorcycle')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="brand" className="text-right text-blue-900">
                      {t('vehicleManagement.brand')}
                    </Label>
                    <Input
                      id="brand"
                      value={newVehicle.brand}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, brand: e.target.value }))}
                      className="col-span-3 border-blue-200 focus:border-blue-400"
                      placeholder="e.g. Toyota"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="model" className="text-right text-blue-900">
                      {t('vehicleManagement.model')}
                    </Label>
                    <Input
                      id="model"
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, model: e.target.value }))}
                      className="col-span-3 border-blue-200 focus:border-blue-400"
                      placeholder="e.g. Vios"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="year" className="text-right text-blue-900">
                      {t('vehicleManagement.year')}
                    </Label>
                    <Input
                      id="year"
                      value={newVehicle.year}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, year: e.target.value }))}
                      className="col-span-3 border-blue-200 focus:border-blue-400"
                      placeholder="e.g. 2020"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleAddVehicle}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {t('vehicleManagement.addVehicle')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {vehicles.length > 0 ? (
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-primary/10 bg-card/80 backdrop-blur-lg">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                          <div className="bg-primary/10 p-3 rounded-full">
                            <Car className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-primary">{vehicle.plateNumber}</h3>
                            <p className="text-primary/80">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedVehicle(vehicle)}
                                className="text-primary hover:text-primary/80 hover:bg-primary/10"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle className="text-blue-900">{t('vehicleManagement.editVehicle')}</DialogTitle>
                                <DialogDescription className="text-blue-600">
                                  {t('vehicleManagement.updateVehicleDetails')}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-plateNumber" className="text-right text-blue-900">
                                    {t('vehicleManagement.plateNumber')}
                                  </Label>
                                  <Input
                                    id="edit-plateNumber"
                                    value={selectedVehicle?.plateNumber}
                                    onChange={(e) => setSelectedVehicle(prev => prev ? { ...prev, plateNumber: e.target.value } : null)}
                                    className="col-span-3 border-blue-200 focus:border-blue-400"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-type" className="text-right text-blue-900">
                                    {t('vehicleManagement.type')}
                                  </Label>
                                  <Select
                                    value={selectedVehicle?.type}
                                    onValueChange={(value) => setSelectedVehicle(prev => prev ? { ...prev, type: value } : null)}
                                  >
                                    <SelectTrigger className="col-span-3 border-blue-200 focus:border-blue-400">
                                      <SelectValue placeholder={t('vehicleManagement.selectVehicleType')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Sedan">{t('vehicleManagement.sedan')}</SelectItem>
                                      <SelectItem value="SUV">{t('vehicleManagement.suv')}</SelectItem>
                                      <SelectItem value="Truck">{t('vehicleManagement.truck')}</SelectItem>
                                      <SelectItem value="Van">{t('vehicleManagement.van')}</SelectItem>
                                      <SelectItem value="Motorcycle">{t('vehicleManagement.motorcycle')}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-brand" className="text-right text-blue-900">
                                    {t('vehicleManagement.brand')}
                                  </Label>
                                  <Input
                                    id="edit-brand"
                                    value={selectedVehicle?.brand}
                                    onChange={(e) => setSelectedVehicle(prev => prev ? { ...prev, brand: e.target.value } : null)}
                                    className="col-span-3 border-blue-200 focus:border-blue-400"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-model" className="text-right text-blue-900">
                                    {t('vehicleManagement.model')}
                                  </Label>
                                  <Input
                                    id="edit-model"
                                    value={selectedVehicle?.model}
                                    onChange={(e) => setSelectedVehicle(prev => prev ? { ...prev, model: e.target.value } : null)}
                                    className="col-span-3 border-blue-200 focus:border-blue-400"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-year" className="text-right text-blue-900">
                                    {t('vehicleManagement.year')}
                                  </Label>
                                  <Input
                                    id="edit-year"
                                    value={selectedVehicle?.year}
                                    onChange={(e) => setSelectedVehicle(prev => prev ? { ...prev, year: e.target.value } : null)}
                                    className="col-span-3 border-blue-200 focus:border-blue-400"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  type="submit"
                                  onClick={handleEditVehicle}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  {t('vehicleManagement.saveChanges')}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-blue-100">
              <CardContent className="p-12 text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <AlertCircle className="h-12 w-12 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">{t('vehicleManagement.noVehiclesFound')}</h3>
                <p className="text-blue-600 mb-6">
                  {t('vehicleManagement.noVehiclesYet')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
