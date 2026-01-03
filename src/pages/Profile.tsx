import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Building, Briefcase, Calendar, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    updateProfile(formData);
    setIsLoading(false);
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your changes have been saved successfully.",
    });
  };

  const profileFields = [
    { label: 'Employee ID', value: user?.employeeId, icon: User, editable: false },
    { label: 'Email', value: user?.email, icon: Mail, editable: false },
    { label: 'Phone', value: user?.phone, icon: Phone, editable: true, key: 'phone' },
    { label: 'Department', value: user?.department, icon: Building, editable: false },
    { label: 'Position', value: user?.position, icon: Briefcase, editable: false },
    { label: 'Date of Joining', value: user?.dateOfJoining, icon: Calendar, editable: false },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">View and manage your personal information</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button variant="gradient" onClick={handleSave} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-6 border-b border-border">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary text-3xl font-bold text-primary-foreground shadow-primary">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-muted-foreground">{user?.position}</p>
              <span className="inline-block mt-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground capitalize">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="grid gap-6 pt-6 sm:grid-cols-2">
            {profileFields.map((field) => (
              <div key={field.label} className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <field.icon className="h-4 w-4" />
                  {field.label}
                </Label>
                {isEditing && field.editable && field.key ? (
                  <Input
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [field.key!]: e.target.value })}
                  />
                ) : (
                  <p className="text-foreground font-medium">{field.value || 'Not provided'}</p>
                )}
              </div>
            ))}
          </div>

          {/* Address */}
          <div className="mt-6 space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Address
            </Label>
            {isEditing ? (
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
              />
            ) : (
              <p className="text-foreground font-medium">{user?.address || 'Not provided'}</p>
            )}
          </div>
        </div>

        {/* Salary Card (Read-only) */}
        <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Compensation</h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-accent/50">
            <div>
              <p className="text-sm text-muted-foreground">Annual Salary</p>
              <p className="text-2xl font-bold text-foreground">
                ${user?.salary?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Monthly</p>
              <p className="text-lg font-semibold text-foreground">
                ${((user?.salary || 0) / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
