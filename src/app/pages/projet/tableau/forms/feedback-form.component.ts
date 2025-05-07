import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'ngx-feedback-form',
  template: `
    <nb-card>
      <nb-card-header>
        <h5>Architecture & Patterns (CQRS/.NET)</h5>
      </nb-card-header>
      <nb-card-body>
        <form [formGroup]="feedbackForm" (ngSubmit)="onSubmit()">
          <!-- CQRS Section -->
          <div class="section">
            <h6>CQRS & Architecture</h6>
            <div class="form-group">
              <label>Quel est votre niveau de confort avec l'implémentation actuelle du CQRS ?</label>
              <textarea nbInput fullWidth formControlName="cqrsComfort" rows="3"
                placeholder="Ex: Les handlers deviennent trop complexes..."></textarea>
            </div>

            <div class="form-group">
              <label>Avez-vous rencontré des problèmes de synchronisation entre le Write DB et le Read DB ?</label>
              <textarea nbInput fullWidth formControlName="dbSyncIssues" rows="3"></textarea>
            </div>

            <div class="form-group">
              <label>Comment gérez-vous les migrations de base de données avec Entity Framework ?</label>
              <textarea nbInput fullWidth formControlName="efMigrations" rows="3"></textarea>
            </div>
          </div>

          <!-- Frontend Section -->
          <div class="section">
            <h6>Frontend (Angular)</h6>
            <div class="form-group">
              <label>La gestion des états avec RxJS/NgRx vous semble-t-elle :</label>
              <nb-radio-group formControlName="stateManagement">
                <nb-radio value="verbose">Trop verbeuse</nb-radio>
                <nb-radio value="balanced">Bien équilibrée</nb-radio>
                <nb-radio value="insufficient">Insuffisamment utilisée</nb-radio>
              </nb-radio-group>
            </div>

            <div class="form-group">
              <label>Avez-vous des composants Angular qui contiennent trop de logique métier ?</label>
              <textarea nbInput fullWidth formControlName="businessLogicComponents" rows="3"></textarea>
            </div>

            <div class="form-group">
              <label>Quel est votre plus grand défi avec les performances du frontend ?</label>
              <textarea nbInput fullWidth formControlName="frontendPerformance" rows="3"></textarea>
            </div>
          </div>

          <!-- DevOps Section -->
          <div class="section">
            <h6>DevOps & CI/CD</h6>
            <div class="form-group">
              <label>Combien de temps prend en moyenne un déploiement complet ?</label>
              <input nbInput fullWidth formControlName="deploymentTime">
            </div>

            <div class="form-group">
              <label>Avez-vous déjà dû rollback une version en prod à cause de :</label>
              <nb-checkbox formControlName="rollbackTests">Bugs non captés par les tests</nb-checkbox>
              <nb-checkbox formControlName="rollbackInfra">Problèmes d'infrastructure</nb-checkbox>
              <nb-checkbox formControlName="rollbackConfig">Configuration environment-specific</nb-checkbox>
            </div>

            <div class="form-group">
              <label>Les variables d'environnement sont-elles gérées de façon sécurisée et efficace ?</label>
              <textarea nbInput fullWidth formControlName="envVarsManagement" rows="3"></textarea>
            </div>
          </div>

          <!-- Code Quality Section -->
          <div class="section">
            <h6>Qualité de Code</h6>
            <div class="form-group">
              <label>Quelle partie du codebase vous fait le plus "peur" de modifier ?</label>
              <textarea nbInput fullWidth formControlName="scaryCodebase" rows="3"></textarea>
            </div>

            <div class="form-group">
              <label>La couverture de tests vous semble-t-elle :</label>
              <nb-radio-group formControlName="testCoverage">
                <nb-radio value="sufficient">Suffisante sur les parties critiques</nb-radio>
                <nb-radio value="uneven">Trop inégale</nb-radio>
                <nb-radio value="nonexistent">Presque inexistante</nb-radio>
              </nb-radio-group>
            </div>

            <div class="form-group">
              <label>Avez-vous des exemples de "technical debt" qui bloquent votre productivité ?</label>
              <textarea nbInput fullWidth formControlName="technicalDebt" rows="3"></textarea>
            </div>
          </div>

          <!-- Workflow Section -->
          <div class="section">
            <h6>Workflow & Collaboration</h6>
            <div class="form-group">
              <label>Combien de temps perdez-vous quotidiennement à :</label>
              <div class="time-loss-group">
                <label>Configurer des environnements locaux</label>
                <input nbInput formControlName="timeLossEnv">
              </div>
              <div class="time-loss-group">
                <label>Comprendre le code legacy</label>
                <input nbInput formControlName="timeLossLegacy">
              </div>
              <div class="time-loss-group">
                <label>Résoudre des conflits Git</label>
                <input nbInput formControlName="timeLossGit">
              </div>
            </div>

            <div class="form-group">
              <label>La revue de code est-elle :</label>
              <nb-radio-group formControlName="codeReview">
                <nb-radio value="quick">Un formalité rapide</nb-radio>
                <nb-radio value="learning">Un vrai moment d'apprentissage</nb-radio>
                <nb-radio value="bypassed">Souvent bypassée</nb-radio>
              </nb-radio-group>
            </div>

            <div class="form-group">
              <label>Comment pourrions-nous améliorer l'onboarding des nouveaux développeurs ?</label>
              <textarea nbInput fullWidth formControlName="onboardingImprovement" rows="3"></textarea>
            </div>
          </div>

          <!-- Performance Section -->
          <div class="section">
            <h6>Performance & Monitoring</h6>
            <div class="form-group">
              <label>Quels métriques techniques aimeriez-vous surveiller ?</label>
              <textarea nbInput fullWidth formControlName="desiredMetrics" rows="3"></textarea>
            </div>

            <div class="form-group">
              <label>Avez-vous déjà identifié des :</label>
              <nb-checkbox formControlName="nPlusOne">N+1 queries</nb-checkbox>
              <nb-checkbox formControlName="memoryLeaks">Memory leaks</nb-checkbox>
              <nb-checkbox formControlName="cpuSpikes">CPU spikes récurrents</nb-checkbox>
            </div>
          </div>

          <!-- Open Feedback Section -->
          <div class="section">
            <h6>Open Feedback</h6>
            <div class="form-group">
              <label>Si vous aviez un "jour de dette technique" illimité, par quoi commenceriez-vous ?</label>
              <textarea nbInput fullWidth formControlName="technicalDebtDay" rows="3"></textarea>
            </div>

            <div class="form-group">
              <label>Quel outil/technologie manque cruellement dans notre stack actuelle ?</label>
              <textarea nbInput fullWidth formControlName="missingTechnology" rows="3"></textarea>
            </div>

            <div class="form-group">
              <label>Une chose que vous changeriez immédiatement si vous en aviez le pouvoir ?</label>
              <textarea nbInput fullWidth formControlName="immediateChange" rows="3"></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button nbButton status="primary" type="submit" [disabled]="!feedbackForm.valid">
              Envoyer le feedback
            </button>
          </div>
        </form>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .section {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #edf1f7;
    }
    .section:last-child {
      border-bottom: none;
    }
    h6 {
      margin-bottom: 1.5rem;
      color: #222b45;
      font-weight: 600;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    .time-loss-group {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .time-loss-group label {
      flex: 1;
      margin-bottom: 0;
    }
    .time-loss-group input {
      width: 100px;
      margin-left: 1rem;
    }
    nb-checkbox {
      display: block;
      margin-bottom: 0.5rem;
    }
    nb-radio-group {
      display: block;
      margin-top: 0.5rem;
    }
    nb-radio {
      display: block;
      margin-bottom: 0.5rem;
    }
    .form-actions {
      margin-top: 2rem;
      text-align: right;
    }
    textarea {
      min-height: 60px;
    }
  `]
})
export class FeedbackFormComponent implements OnInit {
  feedbackForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {
    this.createForm();
  }

  ngOnInit() {
    // Récupérer les IDs depuis l'URL si nécessaire
    this.route.params.subscribe(params => {
      // Vous pouvez utiliser params.projetId et params.tableauId si nécessaire
    });
  }

  private createForm() {
    this.feedbackForm = this.fb.group({
      // CQRS & Architecture
      cqrsComfort: ['', Validators.required],
      dbSyncIssues: [''],
      efMigrations: [''],

      // Frontend
      stateManagement: [''],
      businessLogicComponents: [''],
      frontendPerformance: [''],

      // DevOps
      deploymentTime: [''],
      rollbackTests: [false],
      rollbackInfra: [false],
      rollbackConfig: [false],
      envVarsManagement: [''],

      // Code Quality
      scaryCodebase: [''],
      testCoverage: [''],
      technicalDebt: [''],

      // Workflow
      timeLossEnv: [''],
      timeLossLegacy: [''],
      timeLossGit: [''],
      codeReview: [''],
      onboardingImprovement: [''],

      // Performance
      desiredMetrics: [''],
      nPlusOne: [false],
      memoryLeaks: [false],
      cpuSpikes: [false],

      // Open Feedback
      technicalDebtDay: [''],
      missingTechnology: [''],
      immediateChange: ['']
    });
  }

  onSubmit() {
    if (this.feedbackForm.valid) {
      console.log(this.feedbackForm.value);
      // Implémenter la soumission à l'API ici
    }
  }
} 