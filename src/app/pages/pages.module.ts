import { NgModule } from '@angular/core';
import { NbMenuModule, NbCardModule, NbButtonModule, NbIconModule, NbInputModule } from '@nebular/theme';
import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { ECommerceModule } from './e-commerce/e-commerce.module';
import { PagesRoutingModule } from './pages-routing.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import { MenuService } from '../@core/services/menu.service';
import { AuthTestComponent } from './auth-test/auth-test.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    NbIconModule,
    NbInputModule,
    DashboardModule,
    ECommerceModule,
    MiscellaneousModule,
    NbCardModule,
    NbButtonModule,
    CommonModule,
    FormsModule,
  ],
  declarations: [
    PagesComponent,
    AuthTestComponent,
    ProfileComponent,
  ],
  providers: [
    MenuService,
  ],
})
export class PagesModule {
}
