import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';

// import { RouterModule } from '@angular/router';
// import { appRoutesLayouts } from './layouts.routing';

import { AppheaderComponent } from './appheader/appheader.component';
import { AppfooterComponent } from './appfooter/appfooter.component';
import { AppmenuComponent } from './appmenu/appmenu.component';
import { AppsettingsComponent } from './appsettings/appsettings.component';
//import { LoginComponent } from '../login/login.component';
import { HomeComponent } from '../home/home.component';
//import { ControlComponent } from '../control/control.component';
//import { RegisterComponent } from '../register/register.component';
import { LayoutsComponent } from './layouts.component';
//import { ComponentModule } from './components.module';

import {StorageService} from "../../core/services/storage.service";
import {AuthorizatedGuard} from "../../core/guards/authorizated.guard";
import {UserService} from "../../core/services/user.service";
import {AppRoutingLayoutsModule} from "./layouts.routing";

import { DynamicScriptLoaderService } from '../../core/services/dynamic-script-loader.service';


@NgModule({
  declarations: [
//    AppComponent,
    AppheaderComponent,
    AppfooterComponent,
    AppmenuComponent,
    AppsettingsComponent,
//    LoginComponent,
//    HomeComponent,
//    ControlComponent,
//    RegisterComponent,
    LayoutsComponent
  ],
  imports: [
    //BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingLayoutsModule,
    CommonModule
    //RouterModule.forChild(appRoutesLayouts)
  ],
  providers: [
    StorageService,
    AuthorizatedGuard,
    UserService,
    DynamicScriptLoaderService
  ],
  bootstrap: []
})

export class LayoutsModule { }
