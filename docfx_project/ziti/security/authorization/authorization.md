
# Authorization

After becoming fully authenticated, an identity is now restricted by Policies and by Posture Checks.
Policies act as static authorization configuration and are split into distinct policy types for enforcing different
types of authorization. They are documented in detail in the `Policies` section. Posture Checks are dynamic and
continuous authorization. Telemetry from endpoints and from external systems can be used to make dynamic authorization
decisions. They are detailed in the `Posture Check` section.

[![](https://mermaid.ink/img/pako:eNpdkLFuwyAQhl_lxJyou4dWie1EWaK27lJBhitcYhQMFoZUleN3L8J1hm4c9_3fSf_IpFPECnbx2LfwUQm74Qdl6ATr9TPcG_I3LQlirzAQ0I1suMOWly3JK5ydh1c3hOgJ3iJ5TcMpCebowYYURgMys0tU2G3el-ORvp_KFu2F1MNSYcCXSdgyMxU_uiSs8rBZfmv-me_Uedrx0hlDMvyzJGCXgT1v4lenw2P7TkPv7JAd-1nNVqwj36FWqYpRWADBQksdCVakp0J_FUzYKXFzE7XSwXlWnNEMtGIYg2t-rGRF8JEWqNKYau3-qOkXa1x5og)](https://mermaid-js.github.io/mermaid-live-editor/edit#pako:eNpdkLFuwyAQhl_lxJyou4dWie1EWaK27lJBhitcYhQMFoZUleN3L8J1hm4c9_3fSf_IpFPECnbx2LfwUQm74Qdl6ATr9TPcG_I3LQlirzAQ0I1suMOWly3JK5ydh1c3hOgJ3iJ5TcMpCebowYYURgMys0tU2G3el-ORvp_KFu2F1MNSYcCXSdgyMxU_uiSs8rBZfmv-me_Uedrx0hlDMvyzJGCXgT1v4lenw2P7TkPv7JAd-1nNVqwj36FWqYpRWADBQksdCVakp0J_FUzYKXFzE7XSwXlWnNEMtGIYg2t-rGRF8JEWqNKYau3-qOkXa1x5og)

# Authentication Policies

[Authentication Policies](../authentication/authentication-policies.md) define which primary and secondary authentication methods are allowed for an individual
identity and can be read more about in the [Authentication Policies](../authentication/authentication-policies.md) section.