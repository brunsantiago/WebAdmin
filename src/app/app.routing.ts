//import { HomeComponent } from './pages/home/home.component';
//import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
//import { ControlComponent } from './pages/control/control.component';
//import { LayoutsComponent } from './pages/layouts/layouts.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthorizatedGuard } from "./core/guards/authorizated.guard";


export const appRoutes: Routes = [
  {
      path: 'layouts',
      loadChildren: './pages/layouts/layouts.module#LayoutsModule',
      //canActivate: [AuthorizatedGuard]
     // Para restablecer el Login
  },
  {
      path: 'login',
      //component: LoginComponent
      loadChildren: './pages/login/login.module#LoginModule'
  },
  {
      path: 'register',
      component: RegisterComponent
      //loadChildren: './pages/login/login.module#LoginModule'
  },
//   { path: 'login', component: LoginComponent, runGuardsAndResolvers: 'always' },
//   { path: 'layouts',
//     component: LayoutsComponent,
//     children: [
//     {
//       path: '',
//       loadChildren: './pages/layouts/layouts.module#LayoutsModule'}],
//     runGuardsAndResolvers: 'always'},
//   // { path:'home', component: HomeComponent , canActivate: [ AuthorizatedGuard ] },
//   //{ path:'control', component: ControlComponent },
  { path: '', redirectTo: 'layouts', pathMatch: 'full'},
  { path: '**', redirectTo: 'layouts' }
];


// import { NgModule } from '@angular/core';
// import { CommonModule, } from '@angular/common';
// import { BrowserModule  } from '@angular/platform-browser';
// import { Routes, RouterModule } from '@angular/router';
//
// import { AdminLayoutComponent } from './pages/layouts/admin-layout/admin-layout.component';
//
// const routes: Routes =[
//   {
//     path: '',
//     redirectTo: 'home',
//     pathMatch: 'full',
//   }, {
//     path: '',
//     component: AdminLayoutComponent,
//     children: [
//         {
//       path: '',
//       loadChildren: './pages/layouts/admin-layout/admin-layout.module#AdminLayoutModule'
//   }]}
// ];
//
@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ],
})

export class AppRoutingModule { }
