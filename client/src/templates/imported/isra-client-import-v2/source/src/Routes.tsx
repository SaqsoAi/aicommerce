
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import ProductCatalog from './pages/product-catalog';
import ShoppingCartCheckout from './pages/shopping-cart-checkout';
import ProductDetailPage from './pages/product-detail-page';
import UserAccountDashboard from './pages/user-account-dashboard';
import SizeFitCenter from './pages/size-fit-center';
import Homepage from './pages/homepage';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<Homepage />} />
        <Route path="/product-catalog" element={<ProductCatalog />} />
        <Route path="/shopping-cart-checkout" element={<ShoppingCartCheckout />} />
        <Route path="/product-detail-page" element={<ProductDetailPage />} />
        <Route path="/user-account-dashboard" element={<UserAccountDashboard />} />
        <Route path="/size-fit-center" element={<SizeFitCenter />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
