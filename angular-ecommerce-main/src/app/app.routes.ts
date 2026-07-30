import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CartComponent } from './cart/cart.component';
import { ProductComponent } from './product/product.component';
import { PaymentSuccessComponent } from './payment/payment-success/payment-success.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { AdminProductsComponent } from './admin/admin-products/admin-products.component';
import { AdminOrdersComponent } from './admin/admin-orders/admin-orders.component';
import { LoginComponent } from './auth/login/login.component';
import { ChangePasswordComponent } from './auth/change-password/change-password.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'cart', component: CartComponent },
  { path: 'favoritos', component: FavoritesComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'products/:id', component: ProductComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'cuenta/clave',
    component: ChangePasswordComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin/productos',
    component: AdminProductsComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/pedidos',
    component: AdminOrdersComponent,
    canActivate: [adminGuard],
  },
  { path: 'PaymentSuccess', component: PaymentSuccessComponent },
];
