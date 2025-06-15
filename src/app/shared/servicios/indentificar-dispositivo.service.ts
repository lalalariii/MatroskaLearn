import { Injectable } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';

@Injectable({
  providedIn: 'root'
})
export class IndentificarDispositivoService {

  isMovilTablet: boolean;

  constructor(private deviceService: DeviceDetectorService) { 
    //Miramos desde que tipo de dispositivo se esta accediendo (movil, tablet o pc)
    if(this.deviceService.isMobile() || this.deviceService.isTablet()){
      this.isMovilTablet = true;
    }
    else{
      this.isMovilTablet = false;
    }
  }

  isDispositivoMovilTablet(): boolean{
    return this.isMovilTablet;
  }

  isPortrait(): boolean{
    return window.matchMedia('(orientation:portrait)').matches;
  }
  
}
