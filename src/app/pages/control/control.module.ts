import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ControlRoutingModule } from './control-routing.module';
import { ControlComponent } from './control.component';

@NgModule({
    imports: [
        CommonModule,
        ControlRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        BsDatepickerModule.forRoot()
    ],
    declarations: [ControlComponent]
})
export class ControlModule {}
