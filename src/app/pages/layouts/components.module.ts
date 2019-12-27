import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppfooterComponent } from './appfooter/appfooter.component';
import { AppheaderComponent } from './appheader/appheader.component';
import { AppmenuComponent } from './appmenu/appmenu.component';
import { AppsettingsComponent } from './appsettings/appsettings.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
  ],
  declarations: [
    AppfooterComponent,
    AppheaderComponent,
    AppmenuComponent,
    AppsettingsComponent
  ],
  exports: [
    AppfooterComponent,
    AppheaderComponent,
    AppmenuComponent,
    AppsettingsComponent
  ]
})
export class ComponentsModule { }
