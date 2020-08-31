import { ComponentFactoryResolver, ComponentRef, Injectable, Type, ViewContainerRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, TimeoutError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AlertMessage, AlertType, ButtonStyle, GlobalAlertMessage, GlobalAlertType, Message } from './shared.types';
import { AlertComponent } from './alert/alert.component';
import { GlobalAlertComponent } from './global-alert/global-alert.component';
import { DialogComponent } from './dialog/dialog.component';

@Injectable()
export class MessageService {
  private defaultDialogView: ViewContainerRef;
  private modalDialogView: ViewContainerRef;
  private dialogResolver: ComponentFactoryResolver;

  private createComponent<T>(component: Type<T>, view: ViewContainerRef): ComponentRef<T> {
    view.clear();
    const factory = this.dialogResolver.resolveComponentFactory(component);
    return view.createComponent<T>(factory);
  }

  get dialogView(): ViewContainerRef {
    return this.modalDialogView ? this.modalDialogView : this.defaultDialogView;
  }

  public registerModalDialogHandle(view: ViewContainerRef): void {
    this.modalDialogView = view;
  }

  public unregisterModalDialogHandle(): void {
    this.modalDialogView = null;
  }

  public registerDialogHandle(view: ViewContainerRef, resolver: ComponentFactoryResolver): void {
    this.defaultDialogView = view;
    this.dialogResolver = resolver;
  }

  public cleanNotification(): void {
    this.dialogView.clear();
  }

  public showAlert(msg: string, optional?: {alertType?: AlertType, view?: ViewContainerRef}): void {
    this.dialogView.clear();
    const alertView: ViewContainerRef = optional ? optional.view || this.dialogView : this.dialogView;
    const message: AlertMessage = new AlertMessage();
    message.message = msg;
    message.alertType = optional ? optional.alertType || 'success' : 'success';
    const componentRef = this.createComponent(AlertComponent, alertView);
    componentRef.instance.openAlert(message).subscribe(() => alertView.remove(alertView.indexOf(componentRef.hostView)));
  }

  public showGlobalMessage(msg: string,
                           optional?: {
                             alertType?: AlertType,
                             globalAlertType?: GlobalAlertType,
                             errorObject?: HttpErrorResponse | Type<Error> | TimeoutError,
                             view?: ViewContainerRef,
                             endMessage?: string
                           }): void {
    const globalView: ViewContainerRef = optional ? optional.view || this.dialogView : this.dialogView;
    const message: GlobalAlertMessage = new GlobalAlertMessage();
    message.message = msg;
    message.alertType = optional ? optional.alertType || 'danger' : 'danger';
    message.type = optional ? optional.globalAlertType || GlobalAlertType.gatNormal : GlobalAlertType.gatNormal;
    message.errorObject = optional ? optional.errorObject : null;
    message.endMessage = optional && optional.endMessage ? `:${optional.endMessage}` : '';
    const componentRef = this.createComponent(GlobalAlertComponent, globalView);
    componentRef.instance.openAlert(message).subscribe(() => globalView.remove(globalView.indexOf(componentRef.hostView)));
  }

  public showDialog(msg: string,
                    optional?: {
                      title?: string,
                      buttonStyle?: ButtonStyle,
                      data?: any,
                      view?: ViewContainerRef
                    }): Observable<Message> {
    const dialogView = optional ? optional.view || this.dialogView : this.dialogView;
    const message: Message = new Message();
    message.message = msg;
    message.title = optional ? optional.title || 'GLOBAL_ALERT.TITLE' : 'GLOBAL_ALERT.TITLE';
    message.buttonStyle = optional ? optional.buttonStyle || ButtonStyle.OnlyConfirm : ButtonStyle.OnlyConfirm;
    message.data = optional ? optional.data : null;
    const componentRef = this.createComponent(DialogComponent, dialogView);
    return componentRef.instance.openDialog(message)
      .pipe(tap(() => dialogView.remove(dialogView.indexOf(componentRef.hostView))));
  }

  public showOnlyOkDialog(msg: string, title?: string): void {
    this.showDialog(msg, {title: title || 'GLOBAL_ALERT.HINT', buttonStyle: ButtonStyle.OnlyConfirm}).subscribe();
  }

  public showOnlyOkDialogObservable(msg: string, title?: string): Observable<Message> {
    return this.showDialog(msg, {title: title || 'GLOBAL_ALERT.HINT', buttonStyle: ButtonStyle.OnlyConfirm});
  }

  public showYesNoDialog(msg: string, title?: string): Observable<Message> {
    return this.showDialog(msg, {title: title || 'GLOBAL_ALERT.ASK', buttonStyle: ButtonStyle.YesNo});
  }

  public showConfirmationDialog(msg: string, title?: string): Observable<Message> {
    return this.showDialog(msg, {title: title || 'GLOBAL_ALERT.ASK', buttonStyle: ButtonStyle.Confirmation});
  }

  public showDeleteDialog(msg: string, title?: string): Observable<Message> {
    return this.showDialog(msg, {title: title || 'GLOBAL_ALERT.DELETE', buttonStyle: ButtonStyle.Deletion});
  }
}
