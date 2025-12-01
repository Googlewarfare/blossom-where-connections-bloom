import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Shield } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface VerificationRequest {
  id: string;
  full_name: string;
  verification_photo_url: string;
  verification_status: string;
  profile_photos: Array<{
    photo_url: string;
    is_primary: boolean;
  }>;
}

const AdminVerification = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          verification_photo_url,
          verification_status,
          profile_photos(photo_url, is_primary)
        `)
        .eq('verification_status', 'pending')
        .not('verification_photo_url', 'is', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          verification_status: 'approved',
          verified: true
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Verification approved",
        description: "User has been verified successfully"
      });

      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          verification_status: 'rejected',
          verified: false
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Verification rejected",
        description: "User has been notified"
      });

      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getSignedUrl = async (path: string) => {
    const { data } = await supabase.storage
      .from('profile-photos')
      .createSignedUrl(path, 3600);
    return data?.signedUrl || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading verification requests...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Verification Requests</h1>
          </div>
          <p className="text-muted-foreground">
            Review and approve user verification requests
          </p>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No pending verification requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{request.full_name}</span>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Verification Photo:</p>
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/profile-photos/${request.verification_photo_url}`}
                      alt="Verification"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        // Fallback to signed URL if public doesn't work
                        getSignedUrl(request.verification_photo_url).then(url => {
                          if (url) e.currentTarget.src = url;
                        });
                      }}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Profile Photos:</p>
                    <div className="flex gap-2">
                      {request.profile_photos
                        ?.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
                        .slice(0, 3)
                        .map((photo, idx) => (
                          <img
                            key={idx}
                            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/profile-photos/${photo.photo_url}`}
                            alt="Profile"
                            className="w-20 h-20 object-cover rounded-lg"
                            onError={(e) => {
                              getSignedUrl(photo.photo_url).then(url => {
                                if (url) e.currentTarget.src = url;
                              });
                            }}
                          />
                        ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprove(request.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReject(request.id)}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVerification;
