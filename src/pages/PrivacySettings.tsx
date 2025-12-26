import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, MapPin, Eye, Users, Globe, Shield, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PrivacySettings {
  show_exact_location: boolean;
  show_distance: boolean;
  show_online_status: boolean;
  show_last_active: boolean;
  show_profile_in_discovery: boolean;
  allow_profile_indexing: boolean;
  share_activity_with_matches: boolean;
  share_interests_publicly: boolean;
  location_fuzzing_radius_miles: number;
}

const defaultSettings: PrivacySettings = {
  show_exact_location: false,
  show_distance: true,
  show_online_status: true,
  show_last_active: true,
  show_profile_in_discovery: true,
  allow_profile_indexing: false,
  share_activity_with_matches: true,
  share_interests_publicly: true,
  location_fuzzing_radius_miles: 0.5,
};

const PrivacySettingsPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('privacy_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setSettings({
            show_exact_location: data.show_exact_location,
            show_distance: data.show_distance,
            show_online_status: data.show_online_status,
            show_last_active: data.show_last_active,
            show_profile_in_discovery: data.show_profile_in_discovery,
            allow_profile_indexing: data.allow_profile_indexing,
            share_activity_with_matches: data.share_activity_with_matches,
            share_interests_publicly: data.share_interests_publicly,
            location_fuzzing_radius_miles: Number(data.location_fuzzing_radius_miles),
          });
        }
      } catch (error) {
        console.error('Error fetching privacy settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('privacy_settings')
        .upsert({
          user_id: user.id,
          ...settings,
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: 'Privacy settings saved',
        description: 'Your privacy preferences have been updated.',
      });
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save privacy settings.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const InfoTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-2xl p-4">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Privacy Settings - Blossom</title>
        <meta name="description" content="Control your privacy settings, location visibility, and data sharing preferences." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-2xl p-4">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Privacy Settings</h1>
              <p className="text-sm text-muted-foreground">Control how your information is shared</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Location Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location Privacy
                </CardTitle>
                <CardDescription>
                  Control how your location is displayed to other users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="show-exact-location" className="flex-1">
                      Show exact location
                    </Label>
                    <InfoTooltip content="When disabled, your location will be fuzzed to protect your privacy. Other users will see an approximate area instead of your exact position." />
                  </div>
                  <Switch
                    id="show-exact-location"
                    checked={settings.show_exact_location}
                    onCheckedChange={(checked) => updateSetting('show_exact_location', checked)}
                  />
                </div>

                {!settings.show_exact_location && (
                  <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Location fuzzing radius</Label>
                      <span className="text-sm font-medium">
                        {settings.location_fuzzing_radius_miles} miles
                      </span>
                    </div>
                    <Slider
                      value={[settings.location_fuzzing_radius_miles]}
                      onValueChange={([value]) => updateSetting('location_fuzzing_radius_miles', value)}
                      min={0.25}
                      max={2}
                      step={0.25}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your location will appear within a {settings.location_fuzzing_radius_miles}-mile radius of your actual position.
                    </p>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="show-distance" className="flex-1">
                      Show distance to matches
                    </Label>
                    <InfoTooltip content="Allow other users to see how far away you are from them." />
                  </div>
                  <Switch
                    id="show-distance"
                    checked={settings.show_distance}
                    onCheckedChange={(checked) => updateSetting('show_distance', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Profile Visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Profile Visibility
                </CardTitle>
                <CardDescription>
                  Control who can see your profile and activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="show-online-status" className="flex-1">
                      Show online status
                    </Label>
                    <InfoTooltip content="Let others see when you're currently active on the app." />
                  </div>
                  <Switch
                    id="show-online-status"
                    checked={settings.show_online_status}
                    onCheckedChange={(checked) => updateSetting('show_online_status', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="show-last-active" className="flex-1">
                      Show last active time
                    </Label>
                    <InfoTooltip content="Let others see when you were last active on the app." />
                  </div>
                  <Switch
                    id="show-last-active"
                    checked={settings.show_last_active}
                    onCheckedChange={(checked) => updateSetting('show_last_active', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="show-profile-in-discovery" className="flex-1">
                      Show profile in discovery
                    </Label>
                    <InfoTooltip content="When disabled, your profile won't appear in the discovery feed. You can still message existing matches." />
                  </div>
                  <Switch
                    id="show-profile-in-discovery"
                    checked={settings.show_profile_in_discovery}
                    onCheckedChange={(checked) => updateSetting('show_profile_in_discovery', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Data Sharing
                </CardTitle>
                <CardDescription>
                  Control what information is shared with others
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="share-activity-with-matches" className="flex-1">
                      Share activity with matches
                    </Label>
                    <InfoTooltip content="Allow your matches to see your activity like profile updates and new photos." />
                  </div>
                  <Switch
                    id="share-activity-with-matches"
                    checked={settings.share_activity_with_matches}
                    onCheckedChange={(checked) => updateSetting('share_activity_with_matches', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="share-interests-publicly" className="flex-1">
                      Show interests on profile
                    </Label>
                    <InfoTooltip content="Display your interests and hobbies on your public profile." />
                  </div>
                  <Switch
                    id="share-interests-publicly"
                    checked={settings.share_interests_publicly}
                    onCheckedChange={(checked) => updateSetting('share_interests_publicly', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* External Visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  External Visibility
                </CardTitle>
                <CardDescription>
                  Control how your profile appears outside the app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="allow-profile-indexing" className="flex-1">
                      Allow search engine indexing
                    </Label>
                    <InfoTooltip content="When enabled, your profile may appear in search engine results. Keep disabled for maximum privacy." />
                  </div>
                  <Switch
                    id="allow-profile-indexing"
                    checked={settings.allow_profile_indexing}
                    onCheckedChange={(checked) => updateSetting('allow_profile_indexing', checked)}
                  />
                </div>

                {settings.allow_profile_indexing && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-600 dark:text-amber-400">
                    <p className="flex items-start gap-2">
                      <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>
                        Warning: Enabling search engine indexing may make your profile visible outside the app. 
                        We recommend keeping this disabled for privacy.
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate('/settings')}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacySettingsPage;
