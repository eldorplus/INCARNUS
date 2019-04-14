import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}
const translationOptions = {
  provide: TranslateLoader,
  useFactory: (createTranslateLoader),
  deps: [HttpClient]
};
@NgModule({
  imports: [TranslateModule.forRoot({ loader: translationOptions })],
  exports: [TranslateModule] 
})
export class AppTranslationModule {
  constructor() {

  }

}