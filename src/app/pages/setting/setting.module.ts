import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { SettingRoutingModule } from './setting-routing.module';
import { SettingComponent } from './setting.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SettingRoutingModule,
        ReactiveFormsModule,
        BsDatepickerModule.forRoot(),
    ],
    declarations: [SettingComponent]
})
export class SettingModule {}
