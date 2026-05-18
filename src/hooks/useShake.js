// Detecta "shake" do dispositivo usando o acelerômetro e dispara um callback.
// Uso: useShake(() => recarregar());

import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

const LIMIAR = 1.8;       // magnitude (g) considerada um shake
const COOLDOWN_MS = 1500; // intervalo mínimo entre disparos
const INTERVALO_MS = 100; // taxa de leitura do sensor

export function useShake(onShake, { ativo = true } = {}) {
  const ultimoRef = useRef(0);
  const callbackRef = useRef(onShake);
  callbackRef.current = onShake;

  useEffect(() => {
    if (!ativo) return undefined;

    let assinatura;
    let disponivel = true;

    (async () => {
      try {
        const ok = await Accelerometer.isAvailableAsync();
        if (!ok) { disponivel = false; return; }
        Accelerometer.setUpdateInterval(INTERVALO_MS);
        assinatura = Accelerometer.addListener(({ x, y, z }) => {
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          const agora = Date.now();
          if (magnitude > LIMIAR && agora - ultimoRef.current > COOLDOWN_MS) {
            ultimoRef.current = agora;
            callbackRef.current?.();
          }
        });
      } catch (e) {
        disponivel = false;
      }
    })();

    return () => {
      if (assinatura) assinatura.remove();
      if (disponivel) Accelerometer.removeAllListeners();
    };
  }, [ativo]);
}
