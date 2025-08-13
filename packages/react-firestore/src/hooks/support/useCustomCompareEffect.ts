import { type DependencyList, type EffectCallback, useEffect, useRef } from 'react'

type Comparator<Deps extends DependencyList> = (a: Deps, b: Deps) => boolean

export const useCustomCompareEffect = <Deps extends DependencyList>(
  callback: EffectCallback,
  deps: Deps,
  comparator: Comparator<Deps>,
  otherDependencies: DependencyList,
): void => {
  const dependencies = useRef<Deps>(undefined)

  if (dependencies.current === undefined || !comparator(dependencies.current, deps)) {
    dependencies.current = deps
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, [...dependencies.current, ...otherDependencies])
}
