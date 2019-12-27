import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// import { AngularFirestore } from 'angularfire2/firestore';
// import { AngularFireModule } from 'angularfire2';
// import { environment } from '../environments/environment';

//import { Routes, RouterModule } from '@angular/router';
//import { appRoutes } from './app.routing';

import { AppComponent } from './app.component';
//import { LoginComponent } from './pages/login/login.component';
//import { HomeComponent } from './pages/home/home.component';
//import { ControlComponent } from './pages/control/control.component';
import { RegisterComponent } from './pages/register/register.component';
//import { LayoutsComponent } from './pages/layouts/layouts.component';
//import { LayoutsComponent } from './pages/layouts/layouts.module';

//import { AppheaderComponent } from './pages/layouts/appheader/appheader.component';
//import { AppfooterComponent } from './pages/layouts/appfooter/appfooter.component';
//import { AppmenuComponent } from './pages/layouts/appmenu/appmenu.component';
//import { AppsettingsComponent } from './pages/layouts/appsettings/appsettings.component';

//import { ComponentsModule } from './pages/layouts/components.module';

import { StorageService } from "./core/services/storage.service";
import { AuthorizatedGuard } from "./core/guards/authorizated.guard";
import { UserService } from "./core/services/user.service";
import { DynamicScriptLoaderService } from './core/services/dynamic-script-loader.service';
// import { FirestoreService } from './services/firestore/firestore.service';

import { AppRoutingModule } from './app.routing';
//import { SettingComponent } from './pages/setting/setting.component';


@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    //SettingComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    BsDatepickerModule.forRoot()
  ],
  providers: [
    StorageService,
    AuthorizatedGuard,
    UserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
