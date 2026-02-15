import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AdminPanel from '../../views/AdminPanel.vue'
import axios from 'axios'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}))

const mockRouterPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush })
}))

describe('AdminPanel.vue', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    axios.get.mockResolvedValue({ data: { questions: [], answers: [] } })
  })

  afterEach(() => {
    if (wrapper) wrapper.unmount()
  })

  const createWrapper = async () => {
    wrapper = mount(AdminPanel)
    await flushPromises()
    return wrapper
  }

  it('renders the admin panel', async () => {
    await createWrapper()
    expect(wrapper.find('.admin-panel').exists()).toBe(true)
    expect(wrapper.text()).toContain('Admin Moderation Panel')
  })

  it('fetches questions and answers on mount', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { questions: [{ id: 1, question: 'Test Q' }] } })
      .mockResolvedValueOnce({ data: { answers: [{ id: 1, answer: 'Test A' }] } })

    await createWrapper()

    expect(axios.get).toHaveBeenCalledWith('/api/admin/questions')
    expect(axios.get).toHaveBeenCalledWith('/api/admin/saved_answers')
    expect(wrapper.text()).toContain('Test Q')
    expect(wrapper.text()).toContain('Test A')
  })

  it('handles fetch questions error', async () => {
    axios.get.mockRejectedValueOnce(new Error('fail'))
    await createWrapper()
    expect(wrapper.text()).toContain('Failed to load questions.')
  })

  it('handles fetch answers error', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { questions: [] } })
      .mockRejectedValueOnce(new Error('fail'))
    await createWrapper()
    expect(wrapper.text()).toContain('Failed to load answers.')
  })

  it('deletes a question', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { questions: [{ id: 1, question: 'Q1' }, { id: 2, question: 'Q2' }] } })
      .mockResolvedValueOnce({ data: { answers: [] } })
    axios.delete.mockResolvedValue({})

    await createWrapper()
    expect(wrapper.text()).toContain('Q1')

    const deleteBtn = wrapper.findAll('button').find(b => b.text() === 'Delete')
    await deleteBtn.trigger('click')
    await flushPromises()

    expect(axios.delete).toHaveBeenCalledWith('/api/admin/questions/1')
  })

  it('handles delete question error', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { questions: [{ id: 1, question: 'Q1' }] } })
      .mockResolvedValueOnce({ data: { answers: [] } })
    axios.delete.mockRejectedValue(new Error('fail'))

    await createWrapper()
    const deleteBtn = wrapper.findAll('button').find(b => b.text() === 'Delete')
    await deleteBtn.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Failed to delete question.')
  })

  it('deletes an answer', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { questions: [] } })
      .mockResolvedValueOnce({ data: { answers: [{ id: 1, answer: 'A1' }] } })
    axios.delete.mockResolvedValue({})

    await createWrapper()
    const deleteBtn = wrapper.findAll('button').find(b => b.text() === 'Delete')
    await deleteBtn.trigger('click')
    await flushPromises()

    expect(axios.delete).toHaveBeenCalledWith('/api/admin/saved_answers/1')
  })

  it('handles delete answer error', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { questions: [] } })
      .mockResolvedValueOnce({ data: { answers: [{ id: 1, answer: 'A1' }] } })
    axios.delete.mockRejectedValue(new Error('fail'))

    await createWrapper()
    const deleteBtn = wrapper.findAll('button').find(b => b.text() === 'Delete')
    await deleteBtn.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Failed to delete answer.')
  })

  it('fetches API usage', async () => {
    axios.get.mockResolvedValue({ data: { questions: [], answers: [] } })
    await createWrapper()

    axios.get.mockResolvedValueOnce({ data: { total: 100 } })
    const apiBtn = wrapper.findAll('button').find(b => b.text() === 'Track API Usage')
    await apiBtn.trigger('click')
    await flushPromises()

    expect(axios.get).toHaveBeenCalledWith('/api/admin/audit/api_usage')
    expect(wrapper.text()).toContain('API Usage')
  })

  it('handles API usage error', async () => {
    await createWrapper()
    axios.get.mockRejectedValueOnce(new Error('fail'))
    const apiBtn = wrapper.findAll('button').find(b => b.text() === 'Track API Usage')
    await apiBtn.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Failed to fetch API usage.')
  })

  it('fetches Redis keys', async () => {
    await createWrapper()
    axios.get.mockResolvedValueOnce({ data: { keys: ['key1'] } })
    const btn = wrapper.findAll('button').find(b => b.text() === 'Show Redis Keys')
    await btn.trigger('click')
    await flushPromises()
    expect(axios.get).toHaveBeenCalledWith('/api/admin/audit/redis_keys')
    expect(wrapper.text()).toContain('Redis Keys')
  })

  it('handles Redis keys error', async () => {
    await createWrapper()
    axios.get.mockRejectedValueOnce(new Error('fail'))
    const btn = wrapper.findAll('button').find(b => b.text() === 'Show Redis Keys')
    await btn.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Failed to fetch Redis keys.')
  })

  it('fetches logs', async () => {
    await createWrapper()
    axios.get.mockResolvedValueOnce({ data: { logs: 'some log data' } })
    const btn = wrapper.findAll('button').find(b => b.text() === 'View Logs')
    await btn.trigger('click')
    await flushPromises()
    expect(axios.get).toHaveBeenCalledWith('/api/admin/audit/logs')
    expect(wrapper.text()).toContain('Logs')
  })

  it('handles logs error', async () => {
    await createWrapper()
    axios.get.mockRejectedValueOnce(new Error('fail'))
    const btn = wrapper.findAll('button').find(b => b.text() === 'View Logs')
    await btn.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Failed to fetch logs.')
  })

  it('runs maintenance', async () => {
    await createWrapper()
    axios.post.mockResolvedValueOnce({ data: { status: 'ok' } })
    const btn = wrapper.findAll('button').find(b => b.text() === 'Run Maintenance')
    await btn.trigger('click')
    await flushPromises()
    expect(axios.post).toHaveBeenCalledWith('/api/admin/maintenance/run')
    expect(wrapper.text()).toContain('Maintenance Result')
  })

  it('handles maintenance error', async () => {
    await createWrapper()
    axios.post.mockRejectedValueOnce(new Error('fail'))
    const btn = wrapper.findAll('button').find(b => b.text() === 'Run Maintenance')
    await btn.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Failed to run maintenance.')
  })

  it('flushes queues', async () => {
    await createWrapper()
    axios.post.mockResolvedValueOnce({ data: { flushed: true } })
    const btn = wrapper.findAll('button').find(b => b.text() === 'Flush Queues')
    await btn.trigger('click')
    await flushPromises()
    expect(axios.post).toHaveBeenCalledWith('/api/admin/maintenance/flush_queues')
    expect(wrapper.text()).toContain('Flush Queues Result')
  })

  it('handles flush queues error', async () => {
    await createWrapper()
    axios.post.mockRejectedValueOnce(new Error('fail'))
    const btn = wrapper.findAll('button').find(b => b.text() === 'Flush Queues')
    await btn.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Failed to flush queues.')
  })

  it('renders the dashboard link button', async () => {
    await createWrapper()
    const dashBtn = wrapper.find('.dashboard-link')
    expect(dashBtn.exists()).toBe(true)
    expect(dashBtn.text()).toContain('View Dashboard')
  })
})
