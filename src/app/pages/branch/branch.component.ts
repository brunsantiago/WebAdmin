import { Component, OnInit } from '@angular/core';

declare var jQuery: any;
declare var $: any;
declare var inicializarFuncionesBranch: any;

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.css']
})
export class BranchComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    inicializarFuncionesBranch();
  }

}
