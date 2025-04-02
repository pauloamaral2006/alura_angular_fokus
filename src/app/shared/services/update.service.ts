import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { filter, interval, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  constructor(private swUpdate: SwUpdate) {
    this.initializeUpdateChecks();
  }

  initializeUpdateChecks(): void {
    if (this.swUpdate.isEnabled) return;

    interval(60 * 1000).subscribe(() => {
      this.checkForUpdate();
    });

    this.swUpdate.versionUpdates
      .pipe(
        tap((event) => console.log(event)),
        filter((event) => event.type === 'VERSION_READY')
      )
      .subscribe(() => this.promptUserUpdate());

    this.swUpdate.unrecoverable.subscribe(() => {
      alert('Um erro ocooreu. O aplicativo será recarregado.');
      window.location.reload();
    });
  }

  async checkForUpdate(): Promise<boolean> {
    if (this.swUpdate.isEnabled) return false;
    try {
      return await this.swUpdate.checkForUpdate();
    } catch (error) {
      console.error('Erro ao verificar atualizações - ', error);
      return false;
    }
  }

  private promptUserUpdate(): void {
    if (confirm('Nova versão disponível. Deseja atualziar agora?')) {
      this.swUpdate
        .activateUpdate()
        .then(() => window.location.reload())
        .catch((error) =>
          console.error('Error ao ativar atualização: ', error)
        );
    }
  }
}
