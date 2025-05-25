import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profileService';
import { toast } from 'react-toastify';
import { Card, CardHeader, CardContent, CardTitle, CardFooter, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Save, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const EditProfile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await profileService.getUserData();
        if (response.isSucceeded && response.data?.item) {
          setUserData(response.data.item);
          setName(response.data.item.name || '');
          setPhoneNumber(response.data.item.phoneNumber || '');
        }
      } catch (err) {
        toast.error('Profil məlumatı alınmadı');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    let updated = false;
    try {
      // Sadece ad değiştiyse güncelle
      if (name !== userData.name) {
        const res = await profileService.changeName(name);
        if (!res.isSucceeded) throw new Error(res.message || 'Ad güncellenmedi');
        toast.success('Ad uğurla yeniləndi');
        updated = true;
      }
      // Sadece telefon değiştiyse güncelle
      if (phoneNumber !== userData.phoneNumber) {
        const res = await profileService.changePhoneNumber(phoneNumber);
        if (!res.isSucceeded) throw new Error(res.message || 'Telefon güncellenmedi');
        toast.success('Telefon nömrəsi uğurla yeniləndi');
        updated = true;
      }
      if (!updated) {
        toast.info('Heç bir dəyişiklik edilmədi.');
        setSaving(false);
        return;
      }
      navigate('/profile');
    } catch (err) {
      toast.error(err.message || 'Xəta baş verdi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5 cursor-pointer" onClick={() => navigate('/profile')} />
            Profil Məlumatlarını Dəyiş
          </CardTitle>
          <CardDescription>Adınızı və telefon nömrənizi yeniləyin.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name">Ad</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                maxLength={50}
                placeholder="Adınızı daxil edin"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefon Nömrəsi</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                maxLength={20}
                placeholder="Telefon nömrənizi daxil edin"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full gap-1" disabled={saving}>
              <Save className="h-4 w-4" /> Yadda saxla
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditProfile; 