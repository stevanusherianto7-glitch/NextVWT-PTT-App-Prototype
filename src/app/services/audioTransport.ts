/**
 * AudioTransport — kontrak abstrak untuk pengiriman audio real-time.
 *
 * Memisahkan logika orchestrator (`useRadioAudioEngine`) dari topologi audio
 * yang digunakan (mesh Supabase vs LiveKit SFU). Ini inti dari dual-mode
 * (AD-3, PRD §7.2): orchestrator memilih implementasi berdasarkan `USE_SFU`.
 *
 * Implementasi:
 * - `LiveKitAudioTransport` (src/app/services/livekitAudioTransport.ts) — SFU
 * - (mesh tetap di `useAudioStreamer` untuk fallback/dev saat `!USE_SFU`)
 */
export interface AudioTransport {
  /**
   * Hubungkan ke room/channel. Untuk SFU: connect ke LiveKit server.
   * @param roomId  identifier room (mis. `ptt-room-1`)
   * @param token   access token (LiveKit) — kosong untuk mesh
   */
  connect(roomId: string, token: string): Promise<void>;

  /** Putus koneksi dan bersihkan resource. */
  disconnect(): void;

  /**
   * Publish mic track ke room. Dipanggil saat power on / pertama transmit.
   * Untuk SFU: `localParticipant.publishTrack`.
   */
  publishMic(track: MediaStreamTrack): Promise<void>;

  /** Enable/disable mic tanpa putus koneksi (PUSH-TO-TALK TX on/off). */
  setMicEnabled(enabled: boolean): void;

  /**
   * Daftarkan callback saat audio remote diterima.
   * @param cb (userId, MediaStream) — untuk diputar via AudioContext/element
   */
  onRemoteAudio(cb: (userId: string, stream: MediaStream) => void): void;

  /**
   * Daftarkan callback chunk lokal (base64). Hanya relevan untuk mesh/fallback;
   * di SFU audio mengalir via track, callback ini tidak dipanggil.
   */
  onLocalChunk(cb: (base64: string) => void): void;
}
