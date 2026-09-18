# Cross-package tests

This directory holds the Vitest DOM-environment smoke test and will later hold browser, package-consumer, and release-artifact tests that cross workspace boundaries. Tests for one component should live beside that component in the core package. The current test checks the configured runner; it is not a component test.
