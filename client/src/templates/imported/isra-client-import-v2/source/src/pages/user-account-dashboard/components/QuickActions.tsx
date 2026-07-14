import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = ({ onActionClick }) => {
  const actions = [
    {
      id: 'track-order',
      label: 'Track Orders',
      icon: 'Package',
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
      description: 'View order status'
    },
    {
      id: 'wishlist',
      label: 'My Wishlist',
      icon: 'Heart',
      color: 'bg-pink-50 text-pink-600 hover:bg-pink-100',
      description: '12 saved items'
    },
    {
      id: 'size-guide',
      label: 'Size Guide',
      icon: 'Ruler',
      color: 'bg-green-50 text-green-600 hover:bg-green-100',
      description: 'Find perfect fit'
    },
    {
      id: 'style-quiz',
      label: 'Style Quiz',
      icon: 'Sparkles',
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
      description: 'Update preferences'
    },
    {
      id: 'rewards',
      label: 'My Rewards',
      icon: 'Gift',
      color: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
      description: 'Redeem points'
    },
    {
      id: 'support',
      label: 'Get Help',
      icon: 'MessageCircle',
      color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
      description: '24/7 support'
    }
  ];

  return (
    <div className="bg-card rounded-xl p-6 shadow-brand mb-8">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions?.map((action) => (
          <Button
            key={action?.id}
            variant="ghost"
            className={`flex flex-col items-center p-4 h-auto space-y-2 ${action?.color} transition-brand`}
            onClick={() => onActionClick(action?.id)}
          >
            <Icon name={action?.icon} size={24} />
            <div className="text-center">
              <div className="font-medium text-sm">{action?.label}</div>
              <div className="text-xs opacity-70">{action?.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;