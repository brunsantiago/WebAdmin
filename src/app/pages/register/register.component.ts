import { Component, OnInit } from '@angular/core';

import { User } from '../../core/models/user';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  public title = 'SAB-5 ADMIN';
  public user: User;
  public user_register: User;
  public identity;
  public token;
  public errorMessage;
  public alertRegister;

  constructor(
    private _userService: UserService
  )
  {
    //this.user = new User('','','','','','ROLE_USER','');
    this.user_register = new User('','','','','','ROLE_USER','');
  }

  onSubmitRegister(){
    //console.log(this.user_register);
    this._userService.register(this.user_register).subscribe(
      response => {
        let user = response.user;
        this.user_register = user;
        if(!user._id){
          this.alertRegister = 'Se ha producido un error al Registrar usuario';
        }else{
          this.alertRegister = 'El registro se ha realizado correctamente. identificate con ' + this.user_register.email;
          this.user_register = new User('','','','','','ROLE_USER','');
        }
      }
      , error => {
        var errorMessage = <any>error;
        if(errorMessage != null){
          var body = JSON.parse(error._body);
          this.alertRegister = body.message;
          console.log(this.errorMessage);
        }
      });
    }

  ngOnInit() {
  }

}
