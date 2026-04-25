/**
 * Unit tests for create ticket form validation
 */

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';

describe('Create Ticket Form Validation', () => {
  let formBuilder: FormBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [FormBuilder],
    });

    formBuilder = TestBed.inject(FormBuilder);
  });

  /**
   * Helper function to create the form (matching TicketCreatePageComponent)
   */
  function createForm() {
    return formBuilder.group({
      title: ['', { validators: (ctrl) => {
        if (!ctrl.value) return { required: true };
        if (ctrl.value.length < 3) return { minlength: true };
        if (ctrl.value.length > 200) return { maxlength: true };
        return null;
      }}],
      description: ['', { validators: (ctrl) => {
        if (!ctrl.value) return { required: true };
        if (ctrl.value.length < 5) return { minlength: true };
        if (ctrl.value.length > 2000) return { maxlength: true };
        return null;
      }}],
      priority: ['medium'],
      status: ['open'],
      assigned_to_id: [null],
      assigned_to_name: [null],
    });
  }

  describe('Title Field', () => {
    it('should fail validation if title is empty', () => {
      const form = createForm();
      const titleControl = form.get('title');

      titleControl?.setValue('');
      expect(titleControl?.hasError('required')).toBe(true);
    });

    it('should fail validation if title is less than 3 characters', () => {
      const form = createForm();
      const titleControl = form.get('title');

      titleControl?.setValue('ab');
      expect(titleControl?.hasError('minlength')).toBe(true);
    });

    it('should fail validation if title exceeds 200 characters', () => {
      const form = createForm();
      const titleControl = form.get('title');

      const longTitle = 'a'.repeat(201);
      titleControl?.setValue(longTitle);
      expect(titleControl?.hasError('maxlength')).toBe(true);
    });

    it('should pass validation with valid title', () => {
      const form = createForm();
      const titleControl = form.get('title');

      titleControl?.setValue('Valid Title');
      expect(titleControl?.valid).toBe(true);
    });

    it('should accept exactly 200 characters', () => {
      const form = createForm();
      const titleControl = form.get('title');

      const maxTitle = 'a'.repeat(200);
      titleControl?.setValue(maxTitle);
      expect(titleControl?.valid).toBe(true);
    });
  });

  describe('Description Field', () => {
    it('should fail validation if description is empty', () => {
      const form = createForm();
      const descControl = form.get('description');

      descControl?.setValue('');
      expect(descControl?.hasError('required')).toBe(true);
    });

    it('should fail validation if description is less than 5 characters', () => {
      const form = createForm();
      const descControl = form.get('description');

      descControl?.setValue('test');
      expect(descControl?.hasError('minlength')).toBe(true);
    });

    it('should fail validation if description exceeds 2000 characters', () => {
      const form = createForm();
      const descControl = form.get('description');

      const longDesc = 'a'.repeat(2001);
      descControl?.setValue(longDesc);
      expect(descControl?.hasError('maxlength')).toBe(true);
    });

    it('should pass validation with valid description', () => {
      const form = createForm();
      const descControl = form.get('description');

      descControl?.setValue('Valid description text');
      expect(descControl?.valid).toBe(true);
    });

    it('should accept exactly 5 characters', () => {
      const form = createForm();
      const descControl = form.get('description');

      descControl?.setValue('abcde');
      expect(descControl?.valid).toBe(true);
    });

    it('should accept exactly 2000 characters', () => {
      const form = createForm();
      const descControl = form.get('description');

      const maxDesc = 'a'.repeat(2000);
      descControl?.setValue(maxDesc);
      expect(descControl?.valid).toBe(true);
    });
  });

  describe('Priority Field', () => {
    it('should have default value of medium', () => {
      const form = createForm();
      expect(form.get('priority')?.value).toBe('medium');
    });

    it('should accept low priority', () => {
      const form = createForm();
      form.get('priority')?.setValue('low');
      expect(form.get('priority')?.valid).toBe(true);
    });

    it('should accept medium priority', () => {
      const form = createForm();
      form.get('priority')?.setValue('medium');
      expect(form.get('priority')?.valid).toBe(true);
    });

    it('should accept high priority', () => {
      const form = createForm();
      form.get('priority')?.setValue('high');
      expect(form.get('priority')?.valid).toBe(true);
    });
  });

  describe('Status Field', () => {
    it('should have default value of open', () => {
      const form = createForm();
      expect(form.get('status')?.value).toBe('open');
    });

    it('should accept open status', () => {
      const form = createForm();
      form.get('status')?.setValue('open');
      expect(form.get('status')?.valid).toBe(true);
    });

    it('should accept in_progress status', () => {
      const form = createForm();
      form.get('status')?.setValue('in_progress');
      expect(form.get('status')?.valid).toBe(true);
    });

    it('should accept closed status', () => {
      const form = createForm();
      form.get('status')?.setValue('closed');
      expect(form.get('status')?.valid).toBe(true);
    });
  });

  describe('Assigned To Fields', () => {
    it('should be optional and start as null', () => {
      const form = createForm();
      expect(form.get('assigned_to_id')?.value).toBeNull();
      expect(form.get('assigned_to_name')?.value).toBeNull();
    });

    it('should allow both assigned_to fields to be set', () => {
      const form = createForm();
      form.patchValue({
        assigned_to_id: 'user-123',
        assigned_to_name: 'John Doe',
      });

      expect(form.get('assigned_to_id')?.value).toBe('user-123');
      expect(form.get('assigned_to_name')?.value).toBe('John Doe');
    });
  });

  describe('Form Validation', () => {
    it('should be invalid if required fields are missing', () => {
      const form = createForm();

      expect(form.valid).toBe(false);
    });

    it('should be valid with all required fields populated', () => {
      const form = createForm();
      form.patchValue({
        title: 'Valid Ticket Title',
        description: 'Valid ticket description with more than 5 characters',
        priority: 'high',
        status: 'open',
      });

      expect(form.valid).toBe(true);
    });

    it('should be invalid if title is invalid', () => {
      const form = createForm();
      form.patchValue({
        title: 'ab', // too short
        description: 'Valid description text',
        priority: 'high',
        status: 'open',
      });

      expect(form.valid).toBe(false);
    });

    it('should be invalid if description is invalid', () => {
      const form = createForm();
      form.patchValue({
        title: 'Valid Title',
        description: 'test', // too short
        priority: 'high',
        status: 'open',
      });

      expect(form.valid).toBe(false);
    });

    it('should be valid with optional assigned_to fields', () => {
      const form = createForm();
      form.patchValue({
        title: 'Valid Title',
        description: 'Valid description',
        priority: 'medium',
        status: 'in_progress',
        assigned_to_id: 'user-uuid',
        assigned_to_name: 'Jane Smith',
      });

      expect(form.valid).toBe(true);
    });
  });
});

