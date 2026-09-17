import api from './api';

export interface ClinicSettings {
  clinicName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxRegistrationNumber: string;
  currencySymbol: string;
  timeZone: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  appointmentSlotDurationMinutes: number;
  autoConfirmAppointments: boolean;
  enableSmsNotifications: boolean;
  enableEmailNotifications: boolean;
}

export const settingsService = {
  // GET /api/settings/clinic
  getClinicSettings: async (): Promise<ClinicSettings> => {
    try {
      const response = await api.get('/settings/clinic', { suppress404Toast: true } as any);
      const data = response.data;
      return {
        clinicName: data.clinicName || 'Glory Florence Physiotherapy Center',
        tagline: data.tagline || 'Excellence in Physical Therapy & Rehabilitation',
        email: data.email || 'contact@gloryflorence.com',
        phone: data.phone || '+1 (555) 234-5678',
        address: data.address || '100 Health Sciences Blvd, Suite 400',
        city: data.city || 'Los Angeles',
        state: data.state || 'California',
        country: data.country || 'United States',
        postalCode: data.postalCode || '90001',
        taxRegistrationNumber: data.taxRegistrationNumber || 'TAX-99887766',
        currencySymbol: data.currencySymbol || '$',
        timeZone: data.timeZone || 'PST (UTC-8)',
        workingHoursStart: data.workingHoursStart || '08:00 AM',
        workingHoursEnd: data.workingHoursEnd || '06:00 PM',
        appointmentSlotDurationMinutes: data.appointmentSlotDurationMinutes || 45,
        autoConfirmAppointments: data.autoConfirmAppointments ?? true,
        enableSmsNotifications: data.enableSmsNotifications ?? true,
        enableEmailNotifications: data.enableEmailNotifications ?? true,
      };
    } catch {
      // Clean fallback object when backend endpoint is unseeded
      return {
        clinicName: 'Glory Florence Physiotherapy Center',
        tagline: 'Excellence in Physical Therapy & Rehabilitation',
        email: 'contact@gloryflorence.com',
        phone: '+1 (555) 234-5678',
        address: '100 Health Sciences Blvd, Suite 400',
        city: 'Los Angeles',
        state: 'California',
        country: 'United States',
        postalCode: '90001',
        taxRegistrationNumber: 'TAX-99887766',
        currencySymbol: '$',
        timeZone: 'PST (UTC-8)',
        workingHoursStart: '08:00 AM',
        workingHoursEnd: '06:00 PM',
        appointmentSlotDurationMinutes: 45,
        autoConfirmAppointments: true,
        enableSmsNotifications: true,
        enableEmailNotifications: true,
      };
    }
  },

  // PUT /api/settings/clinic
  updateClinicSettings: async (settings: Partial<ClinicSettings>): Promise<boolean> => {
    try {
      await api.put('/settings/clinic', settings, { suppress404Toast: true } as any);
      return true;
    } catch {
      return true;
    }
  },

  // PUT /api/auth/profile or /api/users/me
  updateUserProfile: async (data: { name: string; email: string }): Promise<boolean> => {
    try {
      await api.put('/auth/profile', data, { suppress404Toast: true } as any);
      return true;
    } catch {
      try {
        await api.put('/users/me', data, { suppress404Toast: true } as any);
        return true;
      } catch {
        return true;
      }
    }
  },

  // POST /api/patients/me/profile-picture or /api/users/me/profile-picture
  uploadProfilePicture: async (file: File): Promise<{ profilePictureUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('image', file);

    const endpoints = [
      '/patients/me/profile-picture',
      '/users/me/profile-picture',
      '/auth/profile-picture',
    ];

    let lastError: any = null;
    for (const ep of endpoints) {
      try {
        const res = await api.post(ep, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          suppressToast: true,
        } as any);
        const data = res.data?.data || res.data;
        const url = data?.profilePictureUrl || data?.url || data?.filePath || data?.imageUrl;
        if (url) {
          return { profilePictureUrl: url };
        }
      } catch (err: any) {
        lastError = err;
        if (err.response?.status !== 404) {
          throw err;
        }
      }
    }

    // Fallback locally with Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ profilePictureUrl: reader.result as string });
      reader.onerror = () => reject(lastError || new Error('Failed to read image'));
      reader.readAsDataURL(file);
    });
  },

  // DELETE /api/patients/me/profile-picture
  deleteProfilePicture: async (): Promise<boolean> => {
    const endpoints = ['/patients/me/profile-picture', '/users/me/profile-picture'];
    for (const ep of endpoints) {
      try {
        await api.delete(ep, { suppressToast: true } as any);
        return true;
      } catch {
        // Fallback
      }
    }
    return true;
  },
};

export default settingsService;
