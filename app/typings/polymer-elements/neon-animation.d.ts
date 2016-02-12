// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/// <reference path="../polymer/polymer.d.ts" />

declare namespace PolymerElements {
    interface NeonAnimatableBehavior {
        animationConfig: any;
        entryAnimation: string;
        exitAnimation: string;
        
        getAnimationConfig(type?: string): any[];
    }   
    interface NeonAnimationRunnerBehaviorImpl {
        playAnimation(type?: string, cookie?: any): void;
        cancelAnimation(): void;
    }
    interface NeonAnimationRunnerBehavior extends NeonAnimatableBehavior, NeonAnimationRunnerBehaviorImpl {
    }
}

declare namespace polymer {
    interface Global {
        NeonAnimatableBehavior: PolymerElements.NeonAnimatableBehavior;
        NeonAnimationRunnerBehaviorImpl: PolymerElements.NeonAnimationRunnerBehaviorImpl;
        NeonAnimationRunnerBehavior: PolymerElements.NeonAnimationRunnerBehavior;
    }
}
