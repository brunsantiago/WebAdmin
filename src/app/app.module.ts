import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AppComponent } from './app.component';
import { RegisterComponent } from './pages/register/register.component';
import { StorageService } from "./core/services/storage.service";
import { AuthorizatedGuard } from "./core/guards/authorizated.guard";
import { UserService } from "./core/services/user.service";
import { DynamicScriptLoaderService } from './core/services/dynamic-script-loader.service';
import { AppRoutingModule } from './app.routing';


@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
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
