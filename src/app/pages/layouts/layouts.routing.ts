import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//import { HomeComponent } from '../home/home.component';
//import { ControlComponent } from '../control/control.component';
//import { LoginComponent } from '../login/login.component';
//import { RegisterComponent } from '../register/register.component';
import { LayoutsComponent } from './layouts.component';

//import { AuthorizatedGuard } from "../../core/guards/authorizated.guard";


// export const appRoutesLayouts: Routes = [
//   //{ path:'login', component: LoginComponent },
//   { path:'home', component: HomeComponent, runGuardsAndResolvers: 'always'},
//   { path:'control', component: ControlComponent, runGuardsAndResolvers: 'always'},
//   //{ path:'register', component: RegisterComponent },
//   { path:'', redirectTo: 'home', pathMatch: 'full'}
// ];

const appRoutesLayouts: Routes = [
    {
        path: '',
        component: LayoutsComponent,
        children: [
            {
                path: '',
                redirectTo: 'control'
            },
            {
                path: 'home',
                //component: HomeComponent
                loadChildren: '../home/home.module#HomeModule'
            },
            {
                path: 'control',
                //component: ControlComponent
                loadChildren: '../control/control.module#ControlModule'
            },
            {
                path: 'setting',
                //component: ControlComponent
                loadChildren: '../setting/setting.module#SettingModule'
            },
            {
                path: 'client',
                //component: ControlComponent
                loadChildren: '../client/client.module#ClientModule'
            },
            {
                path: 'branch',
                //component: ControlComponent
                loadChildren: '../branch/branch.module#BranchModule'
            },
            {
                path: 'staff',
                //component: ControlComponent
                loadChildren: '../staff/staff.module#StaffModule'
            },
            {
                path: 'device',
                //component: ControlComponent
                loadChildren: '../device/device.module#DeviceModule'
            }
        ]
    }
];

@NgModule({
  imports: [ RouterModule.forChild(appRoutesLayouts) ],
  exports: [ RouterModule ]
})

export class AppRoutingLayoutsModule { }
