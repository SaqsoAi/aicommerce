import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const RecentOrders = ({ orders, onViewAllOrders, onTrackOrder, onReorder }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-success text-success-foreground';
      case 'shipped':
        return 'bg-blue-500 text-white';
      case 'processing':
        return 'bg-warning text-warning-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-brand">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Recent Orders</h2>
        <Button variant="outline" size="sm" onClick={onViewAllOrders}>
          View All Orders
        </Button>
      </div>
      <div className="space-y-4">
        {orders?.map((order) => (
          <div key={order?.id} className="border border-border rounded-lg p-4 hover:shadow-brand-lg transition-brand">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-start space-x-4">
                <div className="flex -space-x-2">
                  {order?.items?.slice(0, 3)?.map((item, index) => (
                    <Image
                      key={index}
                      src={item?.image}
                      alt={item?.name}
                      className="w-12 h-12 rounded-lg object-cover border-2 border-background"
                    />
                  ))}
                  {order?.items?.length > 3 && (
                    <div className="w-12 h-12 rounded-lg bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-xs font-medium text-muted-foreground">
                        +{order?.items?.length - 3}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-text-primary">Order #{order?.orderNumber}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order?.status)}`}>
                      {order?.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-1">
                    {order?.items?.length} item{order?.items?.length > 1 ? 's' : ''} • ${order?.total}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Ordered on {order?.orderDate}
                  </p>
                  {order?.estimatedDelivery && (
                    <p className="text-xs text-text-secondary">
                      Expected delivery: {order?.estimatedDelivery}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {order?.status?.toLowerCase() !== 'delivered' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTrackOrder(order?.id)}
                    iconName="MapPin"
                    iconPosition="left"
                  >
                    Track
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReorder(order?.id)}
                  iconName="RotateCcw"
                  iconPosition="left"
                >
                  Reorder
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {orders?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No orders yet</h3>
          <p className="text-text-secondary mb-4">Start shopping to see your orders here</p>
          <Button onClick={() => window.location.href = '/product-catalog'}>
            Browse Products
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;