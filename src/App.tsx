import { Route, Switch } from "wouter";
import LandingPage from "@/pages/LandingPage";
import "@/pages/LandingPage.css";
import { AuthProvider } from "@/lib/auth-context";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminPlots from "@/pages/admin/AdminPlots";
import AdminPromos from "@/pages/admin/AdminPromos";
import AdminTestimonials from "@/pages/admin/AdminTestimonials";
import AdminGallery from "@/pages/admin/AdminGallery";
import AdminFaqs from "@/pages/admin/AdminFaqs";
import AdminInspections from "@/pages/admin/AdminInspections";
import AdminReferrals from "@/pages/admin/AdminReferrals";
import AdminStaff from "@/pages/admin/AdminStaff";
import AdminSettings from "@/pages/admin/AdminSettings";
import NotFound from "@/pages/not-found";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin">
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </Route>
        <Route path="/admin/plots">
          <AdminLayout>
            <AdminPlots />
          </AdminLayout>
        </Route>
        <Route path="/admin/promos">
          <AdminLayout>
            <AdminPromos />
          </AdminLayout>
        </Route>
        <Route path="/admin/testimonials">
          <AdminLayout>
            <AdminTestimonials />
          </AdminLayout>
        </Route>
        <Route path="/admin/gallery">
          <AdminLayout>
            <AdminGallery />
          </AdminLayout>
        </Route>
        <Route path="/admin/faqs">
          <AdminLayout>
            <AdminFaqs />
          </AdminLayout>
        </Route>
        <Route path="/admin/inspections">
          <AdminLayout>
            <AdminInspections />
          </AdminLayout>
        </Route>
        <Route path="/admin/referrals">
          <AdminLayout>
            <AdminReferrals />
          </AdminLayout>
        </Route>
        <Route path="/admin/staff">
          <AdminLayout>
            <AdminStaff />
          </AdminLayout>
        </Route>
        <Route path="/admin/settings">
          <AdminLayout>
            <AdminSettings />
          </AdminLayout>
        </Route>
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
