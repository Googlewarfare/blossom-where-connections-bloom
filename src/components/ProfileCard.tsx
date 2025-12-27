import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VerificationBadge } from '@/components/VerificationBadge';
import { OptimizedImage } from '@/components/OptimizedImage';
import { TrustSignals } from '@/components/TrustSignals';
import { MapPin, Briefcase } from 'lucide-react';
import { haptics } from '@/hooks/use-haptics';

interface ProfileCardProps {
  profile: {
    id: string;
    full_name: string;
    age: number | null;
    bio: string | null;
    location: string | null;
    occupation: string | null;
    photo_url: string | null;
    interests: string[];
    distance?: number | null;
    verified: boolean;
  };
  onClick?: () => void;
  showTrustSignals?: boolean;
}

export const ProfileCard = ({ profile, onClick, showTrustSignals = true }: ProfileCardProps) => {
  const handleClick = () => {
    haptics.light();
    onClick?.();
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
      onClick={handleClick}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <OptimizedImage
          src={profile.photo_url || '/placeholder.svg'}
          alt={profile.full_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold">
              {profile.full_name}, {profile.age}
            </h3>
            <VerificationBadge verified={profile.verified} size="md" />
          </div>
          
          {/* Trust Signals */}
          {showTrustSignals && (
            <div className="mb-2">
              <TrustSignals userId={profile.id} variant="compact" maxSignals={3} />
            </div>
          )}
          
          <div className="space-y-1 text-sm">
            {profile.occupation && (
              <div className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                <span>{profile.occupation}</span>
              </div>
            )}
            
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>
                  {profile.location}
                  {profile.distance && ` • ${Math.round(profile.distance)} mi`}
                </span>
              </div>
            )}
          </div>
          
          {profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {profile.interests.slice(0, 3).map((interest, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary"
                  className="text-xs bg-white/20 text-white border-white/30 backdrop-blur-sm"
                >
                  {interest}
                </Badge>
              ))}
              {profile.interests.length > 3 && (
                <Badge 
                  variant="secondary"
                  className="text-xs bg-white/20 text-white border-white/30 backdrop-blur-sm"
                >
                  +{profile.interests.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
