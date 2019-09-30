#include <algorithm>
#include <condition_variable>
#include <iostream>
#include <mutex>
#include <stdexcept>
#include <streambuf>
#include <string>
#include <thread>

// Kudos to http://stackoverflow.com/questions/12410961/c-connect-output-stream-to-input-stream

class threadbuf
    : public std::streambuf
{
private:
    typedef std::streambuf::traits_type traits_type;
    typedef std::string::size_type      string_size_t;

    std::mutex              d_mutex;
    std::condition_variable d_condition;
    std::string             d_out;
    std::string             d_in;
    std::string             d_tmp;
    char*                   d_current;
    bool                    d_closed;

public:
    threadbuf(string_size_t out_size = 16, string_size_t in_size = 64)
        : d_out(std::max(string_size_t(1), out_size), ' ')
        , d_in(std::max(string_size_t(1), in_size), ' ')
        , d_tmp(std::max(string_size_t(1), in_size), ' ')
        , d_current(&this->d_tmp[0])
        , d_closed(false)
    {
        this->setp(&this->d_out[0], &this->d_out[0] + this->d_out.size() - 1);
        this->setg(&this->d_in[0], &this->d_in[0], &this->d_in[0]);
    }
    void close()
    {
        {
            std::unique_lock<std::mutex> lock(this->d_mutex);
            this->d_closed = true;
            while (this->pbase() != this->pptr()) {
                this->internal_sync(lock);
            }
        }
        this->d_condition.notify_all();
    }

private:
    int_type underflow()
    {
        if (this->gptr() == this->egptr())
        {
            std::unique_lock<std::mutex> lock(this->d_mutex);
            while (&this->d_tmp[0] == this->d_current && !this->d_closed) {
                this->d_condition.wait(lock);
            }
            if (&this->d_tmp[0] != this->d_current) {
                std::streamsize size(this->d_current - &this->d_tmp[0]);
                traits_type::copy(this->eback(), &this->d_tmp[0],
                                  this->d_current - &this->d_tmp[0]);
                this->setg(this->eback(), this->eback(), this->eback() + size);
                this->d_current = &this->d_tmp[0];
                this->d_condition.notify_one();
            }
        }
        return this->gptr() == this->egptr()
            ? traits_type::eof()
            : traits_type::to_int_type(*this->gptr());
    }
    int_type overflow(int_type c)
    {
        std::unique_lock<std::mutex> lock(this->d_mutex);
        if (!traits_type::eq_int_type(c, traits_type::eof())) {
            *this->pptr() = traits_type::to_char_type(c);
            this->pbump(1);
        }
        return this->internal_sync(lock)
            ? traits_type::eof()
            : traits_type::not_eof(c);
    }
    int sync()
    {
        std::unique_lock<std::mutex> lock(this->d_mutex);
        return this->internal_sync(lock);
    }
    int internal_sync(std::unique_lock<std::mutex>& lock)
    {
        char* end(&this->d_tmp[0] + this->d_tmp.size());
        while (this->d_current == end && !this->d_closed) {
            this->d_condition.wait(lock);
        }
        if (this->d_current != end)
        {
            std::streamsize size(std::min(end - d_current,
                                          this->pptr() - this->pbase()));
            traits_type::copy(d_current, this->pbase(), size);
            this->d_current += size;
            std::streamsize remain((this->pptr() - this->pbase()) - size);
            traits_type::move(this->pbase(), this->pptr(), remain);
            this->setp(this->pbase(), this->epptr());
            this->pbump(remain);
            this->d_condition.notify_one();
            return 0;
        }
        return traits_type::eof();
    }
};
