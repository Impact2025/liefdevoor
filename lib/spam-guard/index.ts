/**
 * SpamGuard - Wereldklasse Spam Preventie Systeem
 *
 * Detecteert en blokkeert:
 * - Disposable/wegwerp email adressen
 * - Bot-gegenereerde namen (entropy analyse)
 * - Verdachte registratie patronen
 * - IP reputation issues
 * - Form timing anomalies
 */

export { SpamGuard, type SpamCheckResult, type SpamCheckOptions } from './spam-guard'
export { DisposableEmailChecker } from './disposable-emails'
export { NameAnalyzer, type NameAnalysisResult } from './name-analyzer'
export { IPReputationTracker, type IPReputation } from './ip-reputation'
export { FormTimingAnalyzer, type TimingAnalysis } from './form-timing'
export { DISPOSABLE_EMAIL_DOMAINS } from './disposable-domains'
