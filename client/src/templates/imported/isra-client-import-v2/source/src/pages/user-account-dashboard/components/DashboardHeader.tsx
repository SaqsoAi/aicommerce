import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const DashboardHeader = ({ user, loyaltyPoints, membershipTier }) => {
  return (
    <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="relative">
            <Image
              src={user?.avatar}
              alt={user?.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
            />
            <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1">
              <Icon name="Check" size={12} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Welcome back, {user?.name}!</h1>
            <p className="text-white/80 text-sm">Member since {user?.memberSince}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{loyaltyPoints?.toLocaleString()}</div>
            <div className="text-white/80 text-sm">Style Points</div>
          </div>
          <div className="text-center">
            <div className="flex items-center space-x-1">
              <Icon name="Crown" size={16} className="text-accent" />
              <span className="font-semibold">{membershipTier}</span>
            </div>
            <div className="text-white/80 text-sm">Member Tier</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;