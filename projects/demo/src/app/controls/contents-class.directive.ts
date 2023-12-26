import { Directive, HostBinding } from '@angular/core';

/** Adds contents to host. */
@Directive({
  selector: '[appContentsClass]',
  standalone: true
})
export class ContentsClassDirective {
  @HostBinding('class.contents') contentsClass: boolean = true;
}
