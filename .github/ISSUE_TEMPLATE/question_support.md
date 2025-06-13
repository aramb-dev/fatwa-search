---
name: Question / Support Request
about: Ask a question or request support
title: "[QUESTION] Brief summary of your question"
labels: question, support
body:
  - type: textarea
    attributes:
      label: What is your question or what support do you need?
      description: Please provide a clear and concise description of your question or the support you require.
    validations:
      required: true
  - type: textarea
    attributes:
      label: What have you already tried (if anything)?
      description: Describe any steps you've taken to try to answer your question or resolve the issue yourself.
    validations:
      required: false
  - type: textarea
    attributes:
      label: Provide any relevant context or logs.
      description: Include any relevant context, screenshots, or log outputs that might help understand your situation.
    validations:
      required: false
  - type: input
    attributes:
      label: Project version (if applicable)
      description: If your question or support request is related to a specific version of the project, please specify it here.
    validations:
      required: false
---
