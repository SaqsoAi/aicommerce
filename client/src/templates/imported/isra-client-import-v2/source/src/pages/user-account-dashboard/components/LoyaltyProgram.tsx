import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LoyaltyProgram = ({ loyaltyData, onRedeemReward, onViewRewards }) => {
  const { points, tier, nextTier, pointsToNextTier, availableRewards, recentActivity } = loyaltyData;

  const tierColors = {
    'Bronze': 'bg-orange-100 text-orange-800 border-orange-200',
    'Silver': 'bg-gray-100 text-gray-800 border-gray-200',
    'Gold': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Platinum': 'bg-purple-100 text-purple-800 border-purple-200'
  };

  const tierIcons = {
    'Bronze': 'Award',
    'Silver': 'Medal',
    'Gold': 'Crown',
    'Platinum': 'Gem'
  };

  const progressPercentage = nextTier ? ((points - (points - pointsToNextTier)) / pointsToNextTier) * 100 : 100;

  return (
    <div className="bg-card rounded-xl p-6 shadow-brand">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Style Rewards</h2>
        <Button variant="outline" size="sm" onClick={onViewRewards}>
          View All Rewards
        </Button>
      </div>
      {/* Current Tier Status */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full border ${tierColors?.[tier]}`}>
              <Icon name={tierIcons?.[tier]} size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">{tier} Member</h3>
              <p className="text-sm text-text-secondary">{points?.toLocaleString()} points</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{points?.toLocaleString()}</div>
            <div className="text-sm text-text-secondary">Total Points</div>
          </div>
        </div>

        {nextTier && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-text-secondary">Progress to {nextTier}</span>
              <span className="text-sm font-medium text-text-primary">
                {pointsToNextTier} points to go
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      {/* Available Rewards */}
      <div className="mb-6">
        <h3 className="font-medium text-text-primary mb-4">Available Rewards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableRewards?.slice(0, 4)?.map((reward) => (
            <div key={reward?.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Icon name={reward?.icon} size={16} className="text-primary" />
                  <h4 className="font-medium text-text-primary text-sm">{reward?.title}</h4>
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                  {reward?.points} pts
                </span>
              </div>
              <p className="text-xs text-text-secondary mb-3">{reward?.description}</p>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                disabled={points < reward?.points}
                onClick={() => onRedeemReward(reward?.id)}
              >
                {points >= reward?.points ? 'Redeem' : 'Not enough points'}
              </Button>
            </div>
          ))}
        </div>
      </div>
      {/* Recent Activity */}
      <div>
        <h3 className="font-medium text-text-primary mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity?.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className={`p-1 rounded-full ${activity?.type === 'earned' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <Icon
                    name={activity?.type === 'earned' ? 'Plus' : 'Minus'}
                    size={12}
                    className={activity?.type === 'earned' ? 'text-success' : 'text-destructive'}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{activity?.description}</p>
                  <p className="text-xs text-text-secondary">{activity?.date}</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${
                activity?.type === 'earned' ? 'text-success' : 'text-destructive'
              }`}>
                {activity?.type === 'earned' ? '+' : '-'}{activity?.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyProgram;