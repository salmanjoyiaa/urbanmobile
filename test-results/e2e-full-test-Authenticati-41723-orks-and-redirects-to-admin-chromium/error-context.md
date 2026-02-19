# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - link "UrbanSaudi" [ref=e5] [cursor=pointer]:
        - /url: /
    - main [ref=e6]:
      - generic [ref=e8]:
        - generic [ref=e9]:
          - generic [ref=e10]: Sign In
          - generic [ref=e11]: Access your UrbanSaudi account.
        - generic [ref=e12]:
          - generic [ref=e13]:
            - generic [ref=e14]:
              - text: Email
              - textbox "Email" [ref=e15]:
                - /placeholder: you@example.com
            - generic [ref=e16]:
              - text: Password
              - textbox "Password" [ref=e17]
            - button "Sign In" [ref=e18]
          - generic [ref=e19]:
            - text: Don't have an account?
            - link "Sign up" [ref=e20] [cursor=pointer]:
              - /url: /signup
            - text: or
            - link "become an agent" [ref=e21] [cursor=pointer]:
              - /url: /signup/agent
  - region "Notifications alt+T"
```