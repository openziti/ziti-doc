# Endpoint  Initialization

[![](https://mermaid.ink/img/pako:eNqNk01v2zAMhv8KodMGZGkKFDsYQy5JDwGyIGjWmy6qxLjqbDKj5A5d0f8-KojzUaQf8EWmXr18_VB-Np4Dmsok_NMheZxGV4trLeWYG4RrChuOlGFGMUfXxH8uRyarz8ZJjj5unO72stPqhCkLNw3KK3WoEW64y2XDdZmpa-9Q4LLYEmcEftTXfe8K5uwCeKZ1rIcPic_LVDcRdFr_dbuAKT5Gjx8IpYSANYu1BJej0fD71XA0HEHm4vHW4T0LhOliBSuU91pts88CFqJPn7Ccc11Hqi31-9_G4wPJkp2J0CvrQ1UlR7QWmP-y_IaLPlo5oug62Q3vyPloFgdrmNw7XTRf0tc3BrIU9phS3yDBjzsZ61cklLyFsnBtXz1mnQraV7Bny3Suy-A02k9WRCwwVy_yZ0EOTjAtdVFGC7eboGeSGZgWpXUx6HV_1ghgTb7HFq2pdBlw7bomW2PpRaXlWq6eyJsqS4cD021Ndn-HqdauSfvqdSjJdsWX_8IFMBY)](https://mermaid-js.github.io/mermaid-live-editor/edit#pako:eNqNk01v2zAMhv8KodMGZGkKFDsYQy5JDwGyIGjWmy6qxLjqbDKj5A5d0f8-KojzUaQf8EWmXr18_VB-Np4Dmsok_NMheZxGV4trLeWYG4RrChuOlGFGMUfXxH8uRyarz8ZJjj5unO72stPqhCkLNw3KK3WoEW64y2XDdZmpa-9Q4LLYEmcEftTXfe8K5uwCeKZ1rIcPic_LVDcRdFr_dbuAKT5Gjx8IpYSANYu1BJej0fD71XA0HEHm4vHW4T0LhOliBSuU91pts88CFqJPn7Ccc11Hqi31-9_G4wPJkp2J0CvrQ1UlR7QWmP-y_IaLPlo5oug62Q3vyPloFgdrmNw7XTRf0tc3BrIU9phS3yDBjzsZ61cklLyFsnBtXz1mnQraV7Bny3Suy-A02k9WRCwwVy_yZ0EOTjAtdVFGC7eboGeSGZgWpXUx6HV_1ghgTb7HFq2pdBlw7bomW2PpRaXlWq6eyJsqS4cD021Ndn-HqdauSfvqdSjJdsWX_8IFMBY)


## Steps

1. Init - Load config.json
1. Create TUN device
1. Create route for 100.64.0.0 network to TUN
1. Initialize DNS service
1. Load identity
1. Initialize logging
1. Connect to controller
1. Download network configuration
1. Initialize Channels to Edge Routers
1. Initialize Services
	1.	Insert DNS names
	1.	Create routes for IPs to 100.64.0.0 block
1. Collect latency information for ER selection
1. Complete DNS initialization with Service names
1. Periodically check for updates to services or other network config.  Polling controlled by app, including desktop edges and tunnelers, 10 or 15 seconds in OpenZiti releesed software.
1. Update services, add or delete Edge Routers, etc. as necessary.

