import { Directive, HostBinding } from '@angular/core';

/** Adds contents to host. */
@Directive({
    selector: '[appContentsClass]'
})
export class ContentsClassDirective {
  @HostBinding('class.contents') contentsClass = true;
}
