import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ReactiveFormsModule } from '@angular/forms';

import { ControlRoutingModule } from './control-routing.module';
import { ControlComponent } from './control.component';

@NgModule({
    imports: [
        CommonModule,
        ControlRoutingModule,
        ReactiveFormsModule,
        BsDatepickerModule.forRoot()
    ],
    declarations: [ControlComponent]
})
export class ControlModule {}
