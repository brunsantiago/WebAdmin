import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-appmenu',
  templateUrl: './appmenu.component.html',
  styleUrls: ['./appmenu.component.css']
})
export class AppmenuComponent implements OnInit {

  public identity;
  public token;

  constructor(private _userService: UserService) {}

  ngOnInit() {
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    //Plugin Tree - Funcionalidad de Menu
    $('ul').tree();
  }

}
